# Test script to test enhanced document extraction against user's college report format
import re

sample_text = """
DupliSense AI: Intelligent Duplicate Project
Detection and Reuse Recommendation Platform

PHASE I REPORT

Submitted by

GOKUL ANAND B 230701093
GAYATHRI V R 230701090
HARSHITA M A 230701112
JYOSHNA K 230701132

in partial fulfillment for the award of the degree
of
BACHELOR OF ENGINEERING
IN
COMPUTER SCIENCE AND ENGINEERING

RAJALAKSHMI ENGINEERING COLLEGE, CHENNAI
ANNA UNIVERSITY: CHENNAI 600 025
1

ANNA UNIVERSITY, CHENNAI
BONAFIDE CERTIFICATE

Certified that this report titled "DUPLISENSE AI: INTELLIGENT DUPLICATE
PROJECT DETECTION AND REUSE RECOMMENDATION PLATFORM" is the
bonafide work of GOKUL ANAND B (230701093), GAYATHRI V R (230701090),
HARSHITA M A (230701112), and JYOSHNA K (230701132), who carried out the work
under my supervision. Certified further that to the best of my knowledge the work reported
herein does not form part of any other thesis or dissertation on the basis of which a degree or
award was conferred on an earlier occasion on this or any other candidates.

SIGNATURE
Head of the Department

ACKNOWLEDGEMENT

We express our sincere gratitude to our Internal Guide, Mr. Duraimurugan N...

ABSTRACT

DupliSense AI is a web-based intelligent platform designed to detect duplicate and
overlapping software projects within an organization using Natural Language Processing
(NLP) techniques. In large enterprises and academic institutions, multiple teams often
unknowingly develop similar software systems, leading to significant wastage of
engineering hours, computational resources, and budget. DupliSense AI addresses this
problem by automatically analyzing newly submitted project reports — extracting
structured features such as title, description, problem statement, objectives, and technology
stack — and computing semantic similarity against all existing projects in the repository
using TF-IDF (Term Frequency–Inverse Document Frequency) vectorization combined
with Cosine Similarity measurement.

The system classifies project pairs into four similarity levels (High, Medium, Partial, Low)
and automatically generates reuse recommendations when overlap exceeds 50%. A Role-Based Access Control (RBAC) system with three distinct user roles — Developer,
Manager, and Admin — ensures proper governance through a structured approval
workflow. Managers can review, approve, or reject reuse recommendations, while Admins
monitor platform-wide analytics including cost savings, department-level reuse statistics,
and trend analysis.

Keywords: Duplicate Detection, TF-IDF, Cosine Similarity, Natural Language Processing.

CHAPTER 3
PROBLEM STATEMENT AND OBJECTIVES

3.1 Problem Statement

In large organizations and academic institutions, multiple teams frequently develop
software projects that share significant architectural, functional, and technological overlap
— without awareness of each other's work. This leads to the following issues:
● Redundant Development Effort: Teams spend hundreds of engineering hours building systems.
● Wasted Budget: Duplicate development translates directly to wasted financial resources.

Problem Definition: Design and develop an intelligent web-based platform that
automatically detects semantic similarity between software project submissions using NLP
techniques, generates actionable reuse recommendations, and provides governance
through a role-based approval workflow.

3.2 Objectives

● Automated Duplicate Detection: Implement an NLP-based similarity engine using
TF-IDF vectorization and Cosine Similarity to automatically detect overlapping 
projects from structured report submissions.
● Intelligent Feature Extraction: Aggregate multiple structured fields into a unified 
text representation suitable for vectorized comparison.
● Similarity Classification: Classify project pairs into four meaningful similarity levels.
● Automated Reuse Recommendations: Automatically generate reuse recommendations.
"""

import re

BOILERPLATE_PATTERNS = re.compile(
    r'(?:bonafide\s*certificate|certificate|acknowledgement|anna\s*university|'
    r'bachelor\s*of\s*engineering|department\s*of\s*computer\s*science|'
    r'in\s*partial\s*fulfillment|submitted\s*by|internal\s*examiner|'
    r'external\s*examiner|viva-voce|table\s*of\s*contents|list\s*of\s*figures|'
    r'list\s*of\s*tables|declaration|head\s*of\s*the\s*department|internal\s*guide)',
    re.IGNORECASE
)

def is_boilerplate(text):
    if not text:
        return True
    return bool(BOILERPLATE_PATTERNS.search(text[:300]))

def extract_heading_section(raw_text, heading_patterns, next_patterns):
    for hp in heading_patterns:
        regex = re.compile(
            rf'(?:^|\n)\s*{hp}\s*[:：\-–—]?\s*\n+([\s\S]+?)(?=(?:\n\s*(?:{"|".join(next_patterns)})\b)|\Z)',
            re.IGNORECASE | re.MULTILINE
        )
        match = regex.search(raw_text)
        if match:
            val = match.group(1).strip()
            val = re.sub(r'\n\s*\d+\s*\n', '\n', val)
            val = re.sub(r'\s+', ' ', val).strip()
            if len(val) > 20 and not is_boilerplate(val):
                return val
    return None

def infer_title(raw_text):
    quoted_match = re.search(r'(?:report|project)\s*titled\s*["“](.+?)["”]', raw_text, re.IGNORECASE)
    if quoted_match:
        cand = quoted_match.group(1).strip()
        if 10 < len(cand) < 180 and not is_boilerplate(cand):
            return cand.title() if cand.isupper() else cand

    lines = [line.strip() for line in raw_text.strip().split('\n') if line.strip()]
    title_candidates = []
    for line in lines[:8]:
        if re.search(r'(?:phase|submitted|bachelor|anna\s*university|bonafide|author|date|page)', line, re.IGNORECASE):
            break
        if 5 < len(line) < 120:
            title_candidates.append(line)
            if len(' '.join(title_candidates)) > 30:
                break
    
    if title_candidates:
        full_title = ' '.join(title_candidates).strip()
        full_title = re.sub(r'\s+', ' ', full_title)
        if 10 < len(full_title) < 180 and not is_boilerplate(full_title):
            return full_title

    return "Untitled Project"

title = infer_title(sample_text)
print("TITLE:", title)

desc = extract_heading_section(
    sample_text,
    [r'abstract', r'executive\s*summary', r'project\s*summary'],
    [r'keywords', r'chapter\s*\d+', r'table\s*of\s*contents', r'1\.\s*introduction', r'introduction']
)
print("\nDESCRIPTION (ABSTRACT):")
print(desc[:200] if desc else "None")

prob = extract_heading_section(
    sample_text,
    [r'(?:\d+\.\d+\s*)?problem\s*statement', r'(?:\d+\.\d+\s*)?problem\s*definition'],
    [r'(?:\d+\.\d+\s*)?objectives?', r'chapter\s*\d+', r'\d+\.\d+\s+[A-Z]']
)
print("\nPROBLEM STATEMENT:")
print(prob[:200].encode('ascii', 'replace').decode('ascii') if prob else "None")

objs = extract_heading_section(
    sample_text,
    [r'(?:\d+\.\d+\s*)?objectives?', r'(?:\d+\.\d+\s*)?project\s*objectives?', r'(?:\d+\.\d+\s*)?goals?'],
    [r'chapter\s*\d+', r'\d+\.\d+\s+[A-Z]', r'existing\s*system']
)
print("\nOBJECTIVES:")
print(objs[:200].encode('ascii', 'replace').decode('ascii') if objs else "None")
