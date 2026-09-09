"""
DupliSense AI — Semantic Code Segmenter
=========================================
Parses project codebases (via Folder upload or ZIP archive) into logical
code units (functions, classes, endpoints) using:
  1. AST (Abstract Syntax Tree) parsing for Python
  2. Structural regex pattern parsing for JS, TS, Go, Java, C++, Rust
  3. Automatic filter of non-code artifacts (node_modules, .git, venv, binaries)
"""

import os
import ast
import re
import zipfile
import io
from .models import ProjectSourceCode, CodeSegment

# File extension to language mapping
EXT_TO_LANG = {
    '.py': 'python',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.go': 'go',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.sql': 'sql',
    '.html': 'html',
    '.css': 'css',
    '.sh': 'shell',
}

# Directories and files to exclude from code ingestion
EXCLUDE_DIRS = {
    'node_modules', '.git', '__pycache__', 'venv', 'env', '.venv',
    'dist', 'build', '.next', '.nuxt', 'coverage', '.idea', '.vscode',
    'vendor', 'bin', 'obj', 'target', 'out'
}

EXCLUDE_EXTS = {
    '.exe', '.dll', '.so', '.dylib', '.bin', '.obj', '.o', '.class',
    '.pyc', '.pyo', '.pyd', '.zip', '.tar', '.gz', '.7z', '.rar',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.mp4', '.mp3', '.pdf', '.docx', '.xlsx', '.sqlite3', '.db',
    '.lock', '.map', '.min.js', '.min.css'
}


def is_valid_source_file(file_path):
    """Determines if a file should be ingested as project source code."""
    normalized = file_path.replace('\\', '/').lower()
    parts = normalized.split('/')

    # Check excluded directories
    for part in parts:
        if part in EXCLUDE_DIRS or part.startswith('.'):
            return False

    ext = os.path.splitext(file_path)[1].lower()
    if ext in EXCLUDE_EXTS:
        return False

    return ext in EXT_TO_LANG


def segment_python_ast(code_text, file_path):
    """
    Parses Python source code into semantic function and class segments using Python's AST.
    Extracts docstrings, signatures, and line boundaries.
    """
    segments = []
    try:
        tree = ast.parse(code_text)
    except Exception:
        # Fallback to regex if AST fails on syntax or version differences
        return segment_generic_code(code_text, file_path, 'python')

    lines = code_text.splitlines()

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            name = node.name
            docstring = ast.get_docstring(node) or ''
            start_line = getattr(node, 'lineno', 1)
            end_line = getattr(node, 'end_lineno', start_line)
            body_snippet = '\n'.join(lines[start_line - 1:min(end_line, len(lines))])

            # Extract argument signature
            args = [a.arg for a in node.args.args]
            sig = f"def {name}({', '.join(args)})"

            # Check if this is an API route (e.g. FastAPI / Flask decorators)
            seg_type = 'function'
            for dec in node.decorator_list:
                dec_repr = ast.unparse(dec) if hasattr(ast, 'unparse') else ''
                if any(x in dec_repr.lower() for x in ['app.get', 'app.post', 'app.put', 'app.delete', 'router.', 'api_view']):
                    seg_type = 'endpoint'
                    sig = f"[{dec_repr}] {sig}"
                    break

            segments.append({
                'name': name,
                'segment_type': seg_type,
                'docstring': docstring,
                'signature': sig,
                'code_content': body_snippet[:3000],  # Cap snippet length
                'start_line': start_line,
                'end_line': end_line,
                'file_path': file_path,
            })

        elif isinstance(node, ast.ClassDef):
            name = node.name
            docstring = ast.get_docstring(node) or ''
            start_line = getattr(node, 'lineno', 1)
            end_line = getattr(node, 'end_lineno', start_line)
            body_snippet = '\n'.join(lines[start_line - 1:min(end_line, len(lines))])

            bases = [b.id for b in node.bases if isinstance(b, ast.Name)]
            sig = f"class {name}({', '.join(bases)})" if bases else f"class {name}"

            segments.append({
                'name': name,
                'segment_type': 'class',
                'docstring': docstring,
                'signature': sig,
                'code_content': body_snippet[:3000],
                'start_line': start_line,
                'end_line': end_line,
                'file_path': file_path,
            })

    return segments


def segment_generic_code(code_text, file_path, language):
    """
    Structural regex segmentation for JS, TS, Go, Java, C++, and fallback for syntax-invalid code.
    """
    segments = []
    lines = code_text.splitlines()

    # Regex patterns for functions, classes, and HTTP route endpoints
    fn_pattern = re.compile(
        r'^\s*(?:export\s+)?(?:async\s+)?(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+([a-zA-Z0-9_]+)|func\s+(?:\([^)]*\)\s*)?([a-zA-Z0-9_]+)|public\s+[\w<>[\]]+\s+([a-zA-Z0-9_]+)\s*\()',
        re.MULTILINE
    )
    route_pattern = re.compile(
        r'^\s*(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
        re.MULTILINE
    )
    class_pattern = re.compile(
        r'^\s*(?:export\s+)?class\s+([a-zA-Z0-9_$]+)',
        re.MULTILINE
    )

    # Route endpoints (Express / Node.js)
    for match in route_pattern.finditer(code_text):
        method, path_str = match.group(1).upper(), match.group(2)
        name = f"[{method}] {path_str}"
        line_no = code_text[:match.start()].count('\n') + 1
        snippet = '\n'.join(lines[line_no - 1:min(line_no + 35, len(lines))])

        segments.append({
            'name': name,
            'segment_type': 'endpoint',
            'docstring': f"HTTP {method} route handler for {path_str}",
            'signature': match.group(0).strip(),
            'code_content': snippet[:3000],
            'start_line': line_no,
            'end_line': min(line_no + 35, len(lines)),
            'file_path': file_path,
        })

    for match in fn_pattern.finditer(code_text):
        name = next(g for g in match.groups() if g is not None)
        line_no = code_text[:match.start()].count('\n') + 1
        snippet = '\n'.join(lines[line_no - 1:min(line_no + 35, len(lines))])

        segments.append({
            'name': name,
            'segment_type': 'function',
            'docstring': '',
            'signature': match.group(0).strip(),
            'code_content': snippet[:3000],
            'start_line': line_no,
            'end_line': min(line_no + 35, len(lines)),
            'file_path': file_path,
        })

    for match in class_pattern.finditer(code_text):
        name = match.group(1)
        line_no = code_text[:match.start()].count('\n') + 1
        snippet = '\n'.join(lines[line_no - 1:min(line_no + 45, len(lines))])

        segments.append({
            'name': name,
            'segment_type': 'class',
            'docstring': '',
            'signature': match.group(0).strip(),
            'code_content': snippet[:3000],
            'start_line': line_no,
            'end_line': min(line_no + 45, len(lines)),
            'file_path': file_path,
        })

    return segments


def segment_code_file(code_text, file_path):
    """Dispatches code segmentation based on file extension."""
    ext = os.path.splitext(file_path)[1].lower()
    lang = EXT_TO_LANG.get(ext, 'text')

    if lang == 'python':
        return segment_python_ast(code_text, file_path)
    else:
        return segment_generic_code(code_text, file_path, lang)


def ingest_zip_archive(zip_file_obj, project):
    """
    Ingests a ZIP archive of a project repository into SQLite models:
      - ProjectSourceCode (files)
      - CodeSegment (AST functions/classes)
    """
    stats = {
        'files_saved': 0,
        'segments_saved': 0,
        'languages': set(),
        'total_lines': 0,
    }

    try:
        with zipfile.ZipFile(zip_file_obj) as zf:
            for member in zf.infolist():
                if member.is_dir():
                    continue

                file_path = member.filename
                if not is_valid_source_file(file_path):
                    continue

                try:
                    raw_bytes = zf.read(member)
                    content = raw_bytes.decode('utf-8', errors='replace')
                except Exception:
                    continue

                if len(content.strip()) < 10:
                    continue

                ext = os.path.splitext(file_path)[1].lower()
                lang = EXT_TO_LANG.get(ext, 'text')
                lines = content.splitlines()
                line_count = len(lines)

                # Save or update ProjectSourceCode
                source_code, _ = ProjectSourceCode.objects.update_or_create(
                    project=project,
                    file_path=file_path,
                    defaults={
                        'language': lang,
                        'content': content,
                        'line_count': line_count,
                        'file_size': member.file_size,
                    }
                )

                # Extract and save AST segments
                segments = segment_code_file(content, file_path)
                for seg in segments:
                    CodeSegment.objects.create(
                        project=project,
                        source_file=source_code,
                        file_path=file_path,
                        name=seg['name'],
                        segment_type=seg['segment_type'],
                        docstring=seg.get('docstring', ''),
                        signature=seg.get('signature', ''),
                        code_content=seg['code_content'],
                        start_line=seg.get('start_line', 1),
                        end_line=seg.get('end_line', 1),
                    )
                    stats['segments_saved'] += 1

                stats['files_saved'] += 1
                stats['languages'].add(lang)
                stats['total_lines'] += line_count

    except Exception as e:
        raise ValueError(f"Failed to process ZIP archive: {e}")

    stats['languages'] = list(stats['languages'])
    return stats


def ingest_file_list(files_with_paths, project):
    """
    Ingests a list of (file_obj, relative_path) tuples from browser directory uploads.
    """
    stats = {
        'files_saved': 0,
        'segments_saved': 0,
        'languages': set(),
        'total_lines': 0,
    }

    for file_obj, rel_path in files_with_paths:
        if not is_valid_source_file(rel_path):
            continue

        try:
            content = file_obj.read().decode('utf-8', errors='replace')
        except Exception:
            continue

        if len(content.strip()) < 10:
            continue

        ext = os.path.splitext(rel_path)[1].lower()
        lang = EXT_TO_LANG.get(ext, 'text')
        lines = content.splitlines()
        line_count = len(lines)

        source_code, _ = ProjectSourceCode.objects.update_or_create(
            project=project,
            file_path=rel_path,
            defaults={
                'language': lang,
                'content': content,
                'line_count': line_count,
                'file_size': len(content.encode('utf-8')),
            }
        )

        segments = segment_code_file(content, rel_path)
        for seg in segments:
            CodeSegment.objects.create(
                project=project,
                source_file=source_code,
                file_path=rel_path,
                name=seg['name'],
                segment_type=seg['segment_type'],
                docstring=seg.get('docstring', ''),
                signature=seg.get('signature', ''),
                code_content=seg['code_content'],
                start_line=seg.get('start_line', 1),
                end_line=seg.get('end_line', 1),
            )
            stats['segments_saved'] += 1

        stats['files_saved'] += 1
        stats['languages'].add(lang)
        stats['total_lines'] += line_count

    stats['languages'] = list(stats['languages'])
    return stats
