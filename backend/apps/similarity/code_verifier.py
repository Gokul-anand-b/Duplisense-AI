"""
DupliSense AI — Code Verifier & Cross-Modal FAISS Code Search Engine
=====================================================================
Indexes real code segments (AST functions, classes, endpoints) into a
dedicated FAISS Code Vector Database (`faiss_code_index.bin`) and executes
cross-modal queries to match incoming project proposals (PDF/DOCX) against
existing executable codebases.
"""

import os
import faiss
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from apps.projects.models import CodeSegment, Project

FAISS_CODE_INDEX_FILE = os.path.join(os.path.dirname(__file__), 'faiss_code_index.bin')

class FAISSCodeEngine:
    """
    Dedicated FAISS Dense Vector Engine for source code segments (AST functions, classes, routes).
    Vector dimension: 512. Distance metric: Cosine Similarity (IndexFlatIP on normalized vectors).
    """

    def __init__(self, dimension=512):
        self.dimension = dimension
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 3),
            max_features=dimension,
            sublinear_tf=True
        )
        self.index = faiss.IndexFlatIP(dimension)
        self.segment_ids = []

    def _extract_segment_representation(self, segment):
        """Combines signature, docstring, symbol name, project context, and code text into an embedding query."""
        proj_title = segment.project.title if segment.project else ""
        proj_techs = " ".join(segment.project.all_technologies) if segment.project else ""
        parts = [
            f"project: {proj_title}",
            f"tech: {proj_techs}",
            f"name: {segment.name}",
            f"type: {segment.segment_type}",
            f"file: {segment.file_path}",
            f"signature: {segment.signature}",
            f"doc: {segment.docstring}",
            segment.code_content[:1200]  # code logic
        ]
        return ' '.join(parts)

    def fit_and_index_all_segments(self, exclude_project_id=None):
        """Builds and indexes vector embeddings for all code segments stored in the database."""
        qs = CodeSegment.objects.all().select_related('project')
        if exclude_project_id:
            qs = qs.exclude(project_id=exclude_project_id)

        segments = list(qs)
        if not segments:
            self.index.reset()
            self.segment_ids = []
            return 0

        texts = [self._extract_segment_representation(s) for s in segments]
        tfidf_matrix = self.vectorizer.fit_transform(texts).toarray().astype('float32')

        actual_dim = tfidf_matrix.shape[1]
        if actual_dim < self.dimension:
            padded = np.zeros((len(segments), self.dimension), dtype='float32')
            padded[:, :actual_dim] = tfidf_matrix
            tfidf_matrix = padded
        elif actual_dim > self.dimension:
            tfidf_matrix = tfidf_matrix[:, :self.dimension]

        faiss.normalize_L2(tfidf_matrix)

        self.index.reset()
        self.index.add(tfidf_matrix)
        self.segment_ids = [s.id for s in segments]

        # Save FAISS index
        try:
            faiss.write_index(self.index, FAISS_CODE_INDEX_FILE)
        except Exception:
            pass

        return self.index.ntotal

    def search_code(self, query_text, top_k=6, exclude_project_id=None):
        """
        Executes cross-modal semantic search against the FAISS code index.
        Takes a natural language query (from a PDF report or requirements doc)
        and finds the closest matching executable functions and classes.
        """
        if self.index.ntotal == 0:
            self.fit_and_index_all_segments(exclude_project_id)

        if self.index.ntotal == 0:
            return []

        try:
            query_vec = self.vectorizer.transform([query_text]).toarray().astype('float32')
        except Exception:
            return []

        actual_dim = query_vec.shape[1]
        if actual_dim < self.dimension:
            padded = np.zeros((1, self.dimension), dtype='float32')
            padded[:, :actual_dim] = query_vec
            query_vec = padded
        else:
            query_vec = query_vec[:, :self.dimension]

        faiss.normalize_L2(query_vec)
        distances, indices = self.index.search(query_vec, min(top_k * 2, self.index.ntotal))

        results = []
        seen_ids = set()

        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx < len(self.segment_ids):
                seg_id = self.segment_ids[idx]
                if seg_id in seen_ids:
                    continue
                seen_ids.add(seg_id)

                try:
                    seg = CodeSegment.objects.select_related('project').get(id=seg_id)
                    if exclude_project_id and seg.project_id == exclude_project_id:
                        continue

                    score_pct = int(min(max(dist * 100 * 2.1, 20), 96))
                    results.append({
                        'segment_id': seg.id,
                        'project_id': seg.project.id,
                        'project_title': seg.project.title,
                        'file_path': seg.file_path,
                        'name': seg.name,
                        'segment_type': seg.segment_type,
                        'signature': seg.signature or f"{seg.segment_type} {seg.name}",
                        'docstring': seg.docstring,
                        'start_line': seg.start_line,
                        'end_line': seg.end_line,
                        'code_content': seg.code_content,
                        'similarity_score': score_pct,
                    })
                    if len(results) >= top_k:
                        break
                except CodeSegment.DoesNotExist:
                    continue

        return results


# Global singleton FAISS Code Engine
faiss_code_engine = FAISSCodeEngine(dimension=512)


def verify_document_against_codebase(extracted_fields, exclude_project_id=None, top_k=5):
    """
    Cross-modal verification:
    Takes parsed PDF/DOCX fields (title, description, problem statement, objectives, tech stack)
    and queries the FAISS code database to identify real existing code implementations.

    Returns: {
        'total_matching_functions': int,
        'highest_code_overlap_score': int,
        'code_reusability_level': str ('high' | 'medium' | 'low'),
        'matching_segments': list,
        'verdict': str,
        'estimated_hours_saved': int
    }
    """
    # Formulate query text from PDF specifications
    query_parts = [
        str(extracted_fields.get('title') or ''),
        str(extracted_fields.get('description') or ''),
        str(extracted_fields.get('problem_statement') or ''),
        str(extracted_fields.get('objectives') or ''),
    ]

    # Add technical requirements
    for tech_group in ['programming_languages', 'frameworks', 'database_tech', 'apis_used', 'ai_ml_tech']:
        val = extracted_fields.get(tech_group)
        if isinstance(val, list):
            query_parts.extend(val)
        elif isinstance(val, str) and val:
            query_parts.append(val)

    query_text = ' '.join(query_parts)
    matching_segments = faiss_code_engine.search_code(query_text, top_k=top_k, exclude_project_id=exclude_project_id)

    if not matching_segments:
        return {
            'total_matching_functions': 0,
            'highest_code_overlap_score': 0,
            'code_reusability_level': 'low',
            'matching_segments': [],
            'verdict': 'No matching code implementations found in the database. New implementation required.',
            'estimated_hours_saved': 0,
        }

    highest_score = max(s['similarity_score'] for s in matching_segments)

    if highest_score >= 60:
        level = 'high'
        hours = 160
        target_name = matching_segments[0]['project_title']
        verdict = f"High code-level duplication detected! {len(matching_segments)} functions and classes directly match the proposed specifications in existing project '{target_name}'."
    elif highest_score >= 35:
        level = 'medium'
        hours = 80
        target_name = matching_segments[0]['project_title']
        verdict = f"Moderate code overlap detected. Several shared utilities, routes, and data access models ({len(matching_segments)} modules) can be extracted and reused from '{target_name}'."
    else:
        level = 'low'
        hours = 20
        verdict = "Distinct implementation. Minor functional similarity with existing codebase."

    return {
        'total_matching_functions': len(matching_segments),
        'highest_code_overlap_score': highest_score,
        'code_reusability_level': level,
        'matching_segments': matching_segments,
        'verdict': verdict,
        'estimated_hours_saved': hours,
    }
