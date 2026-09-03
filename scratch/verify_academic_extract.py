import sys
sys.path.insert(0, 'backend')
from apps.projects.extractor import extract_structured_fields, infer_title, infer_description, is_boilerplate

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
workflow.

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
● Intelligent Feature Extraction: Aggregate multiple structured fields into a unified text representation.
● Similarity Classification: Classify project pairs into four meaningful similarity levels.
● Automated Reuse Recommendations: Automatically generate reuse recommendations.
"""

fields, conf = extract_structured_fields(sample_text)
if 'title' not in fields:
    title, tconf = infer_title(sample_text)
    if title:
        fields['title'] = title
if 'description' not in fields:
    desc, dconf = infer_description(sample_text, None, fields.get('title'))
    if desc:
        fields['description'] = desc

print("Extracted Title:", fields.get('title'))
print("\nExtracted Description (Abstract):")
print(fields.get('description', '')[:200])
print("\nExtracted Problem Statement:")
print(fields.get('problem_statement', '')[:200].encode('ascii', 'replace').decode('ascii'))
print("\nExtracted Objectives:")
print(fields.get('objectives', '')[:200].encode('ascii', 'replace').decode('ascii'))
