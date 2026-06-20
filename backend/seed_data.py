#!/usr/bin/env python
"""
StudyGroupManager 더미 데이터 시드 스크립트

Usage:
    python seed_data.py          # 기존 데이터 유지하고 추가
    python seed_data.py --clear  # 기존 데이터 초기화 후 생성
"""
import os
import sys
import random
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studygroupmanager.settings')

import django
django.setup()

from django.db import transaction
from django.utils import timezone

from accounts.models import User
from groups.models import StudyGroup, GroupMembership
from attendance.models import AttendanceSession, AttendanceRecord
from penalty.models import Penalty
from ai.models import (
    AttendanceRiskAnalysis, MonthlyReport,
    StudyGoal, WeeklyProgress, PlannerChatHistory,
)
from support.models import Notice, Resource, CalendarEvent

TODAY = date.today()

# ──────────────────────────────────────────────
# 원시 데이터 (한국어 더미)
# ──────────────────────────────────────────────

USER_DATA = [
    ('kiminjun',  '김민준', 'minjun@example.com'),
    ('leeseoyeon','이서연', 'seoyeon@example.com'),
    ('parkjiho',  '박지호', 'jiho@example.com'),
    ('choiSuA',   '최수아', 'sua@example.com'),
    ('jungwoojin', '정우진','woojin@example.com'),
    ('kanghaeeun', '강하은', 'haeun@example.com'),
    ('yundohyun',  '윤도현', 'dohyun@example.com'),
    ('limjisu',    '임지수', 'jisu@example.com'),
    ('hanjunhyuk', '한준혁', 'junhyuk@example.com'),
    ('ohseohyun',  '오서현', 'seohyun@example.com'),
]

GROUP_DATA = [
    ('알고리즘 스터디',
     'LeetCode·백준 문제풀이 중심의 코딩테스트 대비 스터디입니다. '
     '매주 3회 온라인으로 진행하며, 난이도별 문제를 함께 풀고 코드 리뷰를 진행합니다.',
     8, True),
    ('웹 풀스택 스터디',
     'React · Next.js · Django를 활용한 풀스택 웹 개발 스터디입니다. '
     '실제 서비스 수준의 프로젝트를 팀 단위로 진행하며 코드 리뷰와 기술 발표를 병행합니다.',
     10, True),
    ('영어 회화 스터디',
     '비즈니스 영어 및 일상 회화 향상을 목표로 하는 스터디입니다. '
     '매주 원서 읽기, 토론, 발음 교정 등 다양한 방식으로 진행됩니다.',
     12, True),
    ('데이터사이언스 스터디',
     'Python을 활용한 데이터 분석, 머신러닝, 딥러닝 스터디입니다. '
     'Kaggle 대회 참가를 목표로 하며 논문 리뷰도 병행합니다. '
     '현재 멤버 모집이 종료되어 비활성 상태입니다.',
     6, False),  # edge case: inactive group
]

# 그룹별 (리더_index, [멤버_index...]) — USER_DATA 인덱스 기준
GROUP_MEMBERS = [
    (0, [1, 2, 3, 4, 5]),        # 알고리즘: 김민준 리더
    (1, [2, 4, 5, 6, 7]),        # 웹 풀스택: 이서연 리더
    (2, [3, 6, 7, 8, 9]),        # 영어 회화: 박지호 리더
    (3, [0, 8, 9]),              # 데이터사이언스: 최수아 리더 (소규모 edge case)
]

AI_RISK_PATTERN = [
    ('출석률이 안정적으로 유지되고 있으며, 결석 패턴이 특정 요일에 집중되지 않습니다. '
     '전반적으로 규칙적인 참여가 이루어지고 있어 위험도가 낮습니다.', 0.12, 0.05),
    ('최근 3주간 결석이 2회 발생하였으며, 지각도 1회 있었습니다. '
     '주말 세션 참여율이 주중 대비 낮은 편으로, 일정 조율이 필요합니다.', 0.38, 0.18),
    ('이번 달 출석률이 60% 미만으로 하락하였습니다. '
     '연속 결석이 발생하고 있어 탈퇴 위험이 높아지고 있습니다. '
     '리더의 적극적인 연락과 동기 부여가 필요합니다.', 0.71, 0.55),
    ('출석 패턴이 불규칙합니다. 월·화요일 세션 참여율은 높으나 '
     '목·금요일 세션에서 반복적인 결석이 관찰됩니다. '
     '해당 요일의 개인 일정을 확인해볼 것을 권장합니다.', 0.45, 0.28),
]

MONTHLY_REPORT_CONTENT_GROUP = [
    """## {year}년 {month}월 그룹 월간 리포트

### 전체 출석 현황
- 전체 출석률: {rate}%
- 총 세션 수: {sessions}회
- 평균 참여 인원: {avg_members}명

### 주요 성과
이번 달 스터디는 전반적으로 활발하게 진행되었습니다. 특히 중간 발표 세션에서
모든 멤버가 준비된 발표를 완성하여 긍정적인 피드백을 주고받았습니다.

### AI 분석 인사이트
출석 패턴 분석 결과, 주중 세션의 참여율이 주말 대비 15% 높게 나타났습니다.
다음 달에는 주말 세션 시간대 조정을 고려해볼 것을 권장합니다.

### 다음 달 목표
- 출석률 {target}% 이상 유지
- 개인 발표 세션 2회 진행
- 코드 리뷰 문화 정착""",
]

MONTHLY_REPORT_CONTENT_PERSONAL = [
    """## {year}년 {month}월 개인 월간 리포트

### 내 출석 현황
- 출석률: {rate}%
- 출석: {present}회 / 지각: {late}회 / 결석: {absent}회

### AI 맞춤 피드백
{nickname}님의 이번 달 참여도는 그룹 평균 대비 {diff} 수준입니다.
꾸준한 참여가 학습 성과에 직접적인 영향을 미치므로,
다음 달에는 세션 전 알림 설정을 활용해보세요.

### 개선 제안
- 결석이 발생한 날의 학습 자료를 48시간 내 복습하기
- 지각 발생 시 세션 종료 후 요약 내용 별도 정리하기""",
]

# ai_suggestions는 '\n'으로 구분된 항목으로 저장 — 뷰에서 split('\n')으로 배열 변환 가능
STUDY_GOAL_DATA = [
    ('알고리즘 문제풀이 100문제 달성',
     'LeetCode 기준 Easy 30문제, Medium 50문제, Hard 20문제를 목표 기간 내 해결한다.',
     0.74,
     '알고리즘 분류별 취약점 파악 후 집중 훈련을 권장합니다.\n'
     'DP와 그래프 문제 풀이 시간이 평균보다 2.3배 높으므로 해당 유형 추가 학습이 필요합니다.'),
    ('포트폴리오 프로젝트 완성',
     '실제 배포 가능한 수준의 풀스택 웹 프로젝트를 완성하여 GitHub에 공개한다.',
     0.61,
     '현재 백엔드 구현은 70% 완료되었으나 프론트엔드가 35%에 머물고 있습니다.\n'
     '프론트엔드 집중 스프린트 2주를 권장합니다.'),
    ('영어 비즈니스 이메일 작성 능력 향상',
     'OPIC IH 등급 달성 및 비즈니스 영어 이메일을 오류 없이 작성할 수 있는 수준 도달.',
     0.55,
     '말하기 능력은 향상되고 있으나 작문 연습이 부족합니다.\n'
     '매일 짧은 영어 일기 또는 이메일 초안 작성을 습관화할 것을 권장합니다.'),
    ('Kaggle 대회 상위 20% 진입',
     '데이터 전처리, Feature Engineering, 앙상블 기법을 활용하여 Kaggle 대회에서 상위 20%에 진입한다.',
     0.48,
     'EDA 단계에서 시간이 과도하게 소요되고 있습니다.\n'
     '시각화 라이브러리 숙련도 향상과 함께 Feature 선택 자동화 도구 활용을 권장합니다.'),
]

CHAT_PAIRS = [
    ('이번 주 알고리즘 스터디 준비를 어떻게 해야 할까요?',
     '이번 주는 동적 프로그래밍(DP) 유형 중심으로 준비하시는 것이 좋습니다. '
     'LeetCode에서 Coin Change, Longest Common Subsequence 문제를 먼저 풀어보시고, '
     '풀이 과정에서 메모이제이션과 타뷸레이션 두 가지 방식을 모두 구현해보세요. '
     '스터디 발표를 위해 시간 복잡도 분석도 함께 준비하시면 좋습니다.'),
    ('출석률이 낮아지고 있는데 어떻게 개선할 수 있을까요?',
     '출석률 개선을 위한 몇 가지 실천 방법을 제안드립니다.\n\n'
     '1. 세션 24시간 전 캘린더 알림 설정\n'
     '2. 스터디 전날 저녁 간단한 예습 루틴 만들기\n'
     '3. 결석 시 24시간 내 자료 복습 의무화\n\n'
     '현재 귀하의 결석 패턴을 분석하면 목요일 세션에서 집중적으로 발생하고 있습니다. '
     '목요일 일정을 조율해보시거나 리더에게 시간 변경을 제안해보세요.'),
    ('다음 달 목표를 어떻게 설정하면 좋을까요?',
     '현재 진행 상황을 바탕으로 SMART 목표 설정을 추천드립니다.\n\n'
     '- 구체적(Specific): 알고리즘 Medium 문제 20문제 해결\n'
     '- 측정 가능(Measurable): 주 3문제 기준 약 7주 소요\n'
     '- 달성 가능(Achievable): 현재 풀이 속도 대비 20% 향상 수준\n'
     '- 관련성(Relevant): 취업 코딩테스트 직접 연계\n'
     '- 기한(Time-bound): 다음 달 말일까지\n\n'
     '무엇보다 꾸준함이 중요합니다. 매일 1문제씩 풀어도 한 달에 30문제가 됩니다!'),
    ('팀원과 갈등이 생겼을 때 어떻게 해결해야 하나요?',
     '스터디 내 갈등은 대부분 소통 부재에서 비롯됩니다. 몇 가지 접근 방법을 제안드립니다.\n\n'
     '1. 비폭력적 소통(NVC) 방식으로 감정과 필요를 분리하여 대화하기\n'
     '2. 갈등 사안을 직접 당사자와 1:1로 먼저 이야기하기\n'
     '3. 해결이 어려울 경우 리더에게 중재 요청하기\n\n'
     '스터디의 공동 목표를 상기시키면서 대화를 시작하면 감정적 대립을 줄일 수 있습니다.'),
    ('벌금이 너무 쌓였는데 어떻게 해야 하나요?',
     '벌금 누적은 출석 패턴을 다시 돌아볼 신호입니다. '
     '우선 리더에게 현재 상황을 솔직하게 공유하시고, 분할 납부 가능 여부를 협의해보세요. '
     '앞으로의 출석 개선 계획을 구체적으로 제시하면 리더도 이해해줄 가능성이 높습니다. '
     '이번 달부터 세션 알림을 적극 활용하여 추가 벌금이 쌓이지 않도록 하는 것이 중요합니다.'),
]

NOTICE_DATA = [
    # (제목, 내용, is_pinned, group_index or None)
    ('[공지] 스터디 규칙 안내',
     '안녕하세요, 스터디 그룹 관리자입니다.\n\n'
     '원활한 스터디 운영을 위한 공통 규칙을 안내드립니다.\n\n'
     '1. 세션 30분 전 참석 여부 확인 필수\n'
     '2. 결석 시 리더에게 사전 통보 (최소 2시간 전)\n'
     '3. 무단 결석 3회 누적 시 스터디 제명\n'
     '4. 벌금은 매월 말일까지 납부\n\n'
     '모두가 즐거운 스터디 환경을 만들어 나가요! 감사합니다.',
     True, None),
    ('[공지] 서비스 점검 안내 (6월 20일 새벽 2시~4시)',
     '안녕하세요.\n\n6월 20일(금) 새벽 2:00 ~ 4:00 (2시간) 동안 서버 점검이 예정되어 있습니다.\n'
     '점검 시간 동안에는 서비스 이용이 일시적으로 중단될 수 있으니 양해 부탁드립니다.\n\n'
     '불편을 드려 죄송합니다.',
     True, None),
    ('[안내] 여름 방학 특별 스터디 모집',
     '여름 방학을 맞아 특별 집중 스터디를 모집합니다.\n\n'
     '기간: 7월 7일 ~ 8월 22일 (7주)\n'
     '대상: 기존 멤버 우선, 이후 일반 모집\n'
     '모집 인원: 그룹별 최대 2명 추가\n\n'
     '관심 있으신 분들은 리더에게 문의해주세요.',
     False, None),
    # 그룹별 공지 (각 그룹 index 0~3)
    ('[알고리즘] 이번 주 문제 안내 - DP 집중 주간',
     '안녕하세요 멤버 여러분!\n\n이번 주는 동적 프로그래밍(DP) 집중 주간입니다.\n\n'
     '**필수 풀이 문제**\n'
     '- BOJ 1003 피보나치 함수\n'
     '- BOJ 9251 LCS\n'
     '- LeetCode 322. Coin Change\n'
     '- LeetCode 1143. Longest Common Subsequence\n\n'
     '**추천 문제 (선택)**\n'
     '- BOJ 11053 가장 긴 증가하는 부분 수열\n'
     '- LeetCode 312. Burst Balloons\n\n'
     '목요일 세션까지 최소 3문제 이상 풀어오시고, 풀이 과정을 간단히 정리해오세요. 화이팅!',
     True, 0),
    ('[알고리즘] 6월 코딩테스트 일정 공유',
     '6월 주요 코딩테스트 일정을 공유드립니다.\n\n'
     '- 카카오 인턴십 코딩테스트: 6월 22일\n'
     '- 라인 채용 코딩테스트: 6월 28일\n'
     '- 네이버 하반기 서류·코딩: 7월 초 예정\n\n'
     '본 스터디가 여러분의 취업에 도움이 되길 바랍니다!',
     False, 0),
    ('[알고리즘] 7월 스터디 일정 조율 안건',
     '7월 스터디 일정을 조율하고자 합니다. 아래 구글 폼을 통해 가능한 시간대를 선택해주세요.\n\n'
     '응답 기한: 6월 25일 자정\n'
     '일정 확정 후 공지 예정입니다.',
     False, 0),
    ('[웹스터디] 이번 주 발표자 공지',
     '이번 주 발표자를 안내드립니다.\n\n'
     '- 월요일: 이서연 (Next.js App Router 심층 분석)\n'
     '- 수요일: 정우진 (Django REST Framework 시리얼라이저)\n'
     '- 금요일: 강하은 (Tailwind CSS 커스터마이징)\n\n'
     '발표 자료는 세션 시작 2시간 전까지 공유 폴더에 올려주세요.',
     True, 1),
    ('[웹스터디] GitHub 레포 규칙 업데이트',
     'PR 병합 전 최소 2명 이상의 리뷰 승인을 받도록 규칙이 변경되었습니다.\n\n'
     '또한 커밋 메시지는 Conventional Commits 형식을 따라주세요:\n'
     'feat: 새 기능 / fix: 버그 수정 / docs: 문서 수정 / refactor: 리팩토링',
     False, 1),
    ('[영어스터디] 이번 주 교재 범위 안내',
     '이번 주 학습 범위를 안내드립니다.\n\n'
     'Business English Pro 교재 Chapter 5 (Negotiations & Agreements)\n'
     'p.87~112까지 읽어오시고, p.98 연습 문제를 작성해오세요.\n\n'
     '추가로 TED Talk "The Secret Structure of Great Talks"를 시청하고 '
     '핵심 표현 5가지를 정리해오시면 금상첨화입니다!',
     False, 2),
    ('[영어스터디] 원어민 강사 초청 특강 안내',
     '다음 달 원어민 강사 초청 특강이 예정되어 있습니다.\n\n'
     '일시: 7월 12일 (토) 오후 2시\n'
     '장소: 강남 스터디 카페 (추후 확정)\n'
     '비용: 1인당 15,000원 (당일 현장 수납)\n\n'
     '참석 여부를 6월 30일까지 알려주세요.',
     True, 2),
    ('[데이터사이언스] 스터디 일시 중단 안내',
     '사정으로 인해 데이터사이언스 스터디를 7월 한 달간 일시 중단합니다.\n\n'
     '8월 재개 예정이며, 재개 시 별도 공지 예정입니다.\n'
     '그동안 Kaggle 대회 개인 참가를 통해 실력을 쌓아두시길 권장드립니다.',
     True, 3),
    # 페이지네이션 테스트용 추가 공지 (그룹 0)
    ('[알고리즘] 5월 결산 및 우수 참여자 발표',
     '5월 한 달간 열심히 참여해주신 여러분께 감사드립니다.\n\n'
     '이번 달 우수 참여자:\n🥇 박지호 (출석률 100%, 평균 풀이 속도 최상)\n'
     '🥈 강하은 (코드 리뷰 참여 횟수 1위)\n\n'
     '다음 달도 화이팅입니다!',
     False, 0),
    ('[알고리즘] 그래프 알고리즘 심화 세션 예고',
     'BFS/DFS를 넘어 최단 경로 알고리즘(다익스트라, 벨만-포드, 플로이드-워셜)을 다루는 '
     '심화 세션이 예정되어 있습니다. 기본기 복습을 미리 해오시면 좋습니다.',
     False, 0),
]

RESOURCE_DATA = [
    # (group_index, title, file_url)
    (0, 'DP 알고리즘 핵심 개념 정리.pdf',
     'https://files.example.com/algo/dp_summary.pdf'),
    (0, '그래프 탐색 (BFS·DFS) 풀이 템플릿.py',
     'https://files.example.com/algo/graph_template.py'),
    (0, '코딩테스트 빈출 패턴 100선.pdf',
     'https://files.example.com/algo/top100_patterns.pdf'),
    (0, '시간복잡도 계산 치트시트.png',
     'https://files.example.com/algo/complexity_cheatsheet.png'),
    (0, '5월 스터디 세션 풀이 모음.zip',
     'https://files.example.com/algo/may_solutions.zip'),
    (1, 'Next.js 14 공식 문서 번역 요약.pdf',
     'https://files.example.com/web/nextjs14_summary.pdf'),
    (1, 'Django REST Framework 튜토리얼.md',
     'https://files.example.com/web/drf_tutorial.md'),
    (1, 'Tailwind CSS 컴포넌트 라이브러리 모음.zip',
     'https://files.example.com/web/tailwind_components.zip'),
    (1, 'API 설계 Best Practice 가이드.pdf',
     'https://files.example.com/web/api_best_practice.pdf'),
    (1, '팀 프로젝트 GitHub 레포 링크',
     ''),  # edge case: file_url blank
    (2, 'Business English 핵심 표현 200선.pdf',
     'https://files.example.com/english/expressions_200.pdf'),
    (2, '영어 발음 교정 연습 음성 파일.mp3',
     'https://files.example.com/english/pronunciation.mp3'),
    (2, 'TED Talk 스크립트 모음 (6월).pdf',
     'https://files.example.com/english/ted_june.pdf'),
    (3, 'Pandas 데이터 전처리 핵심 정리.ipynb',
     'https://files.example.com/ds/pandas_preprocessing.ipynb'),
    (3, 'Kaggle 대회 EDA 템플릿.ipynb',
     'https://files.example.com/ds/eda_template.ipynb'),
]

CALENDAR_DATA = [
    # (group_index, title, description, days_offset)  — days_offset: 오늘 기준 상대 일수
    (0, 'DP 알고리즘 집중 세션', 'LeetCode DP Top 20 문제 풀이 및 코드 리뷰', -21),
    (0, '그래프 탐색 세션', 'BFS/DFS 개념 정리 및 실전 문제 풀이', -14),
    (0, '정렬·탐색 알고리즘 세션', '퀵정렬, 병합정렬, 이진탐색 심화', -7),
    (0, '모의 코딩테스트', '실전 대비 90분 모의고사 진행', 3),
    (0, '트리·힙 알고리즘 세션', '트리 순회, 힙 구현 및 활용 문제', 10),
    (0, '7월 오프라인 MT', '강남 스터디 카페 오프라인 모임 및 회식', 21),
    (1, 'Next.js App Router 발표', 'App Router vs Pages Router 비교 분석 발표', -18),
    (1, 'Django API 설계 리뷰', 'REST API 설계 패턴 코드 리뷰', -11),
    (1, '프로젝트 중간 발표', '팀 프로젝트 진행 상황 공유', -4),
    (1, 'CI/CD 파이프라인 구축 세션', 'GitHub Actions를 활용한 자동 배포', 5),
    (1, '최종 프로젝트 발표', '완성된 프로젝트 시연 및 코드 리뷰', 18),
    (2, '비즈니스 이메일 작성 실습', 'Business English Pro Ch.4 실습', -20),
    (2, '프레젠테이션 영어 특강', '영어 발표 스킬 향상 워크숍', -10),
    (2, '원어민 강사 초청 특강', '원어민과 함께하는 실전 회화', 23),
    (3, 'Kaggle 대회 EDA 세션', '타이타닉 데이터셋 EDA 실습', -30),
    (3, '머신러닝 모델 선택 세션', '앙상블 기법 비교 및 적용', -15),
]


def clear_data():
    print('기존 데이터 초기화 중...')
    PlannerChatHistory.objects.all().delete()
    CalendarEvent.objects.all().delete()
    Resource.objects.all().delete()
    Notice.objects.all().delete()
    WeeklyProgress.objects.all().delete()
    StudyGoal.objects.all().delete()
    MonthlyReport.objects.all().delete()
    AttendanceRiskAnalysis.objects.all().delete()
    Penalty.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    AttendanceSession.objects.all().delete()
    GroupMembership.objects.all().delete()
    StudyGroup.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()
    print('초기화 완료\n')


def seed_users():
    print('사용자 생성 중...')
    users = []
    for username, nickname, email in USER_DATA:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'nickname': nickname,
                'role': 'member',
                'is_active': True,
                'is_staff': False,
            },
        )
        if created:
            user.set_password('test1234!')
            user.save()
        users.append(user)
    print(f'  사용자 {len(users)}명 생성 완료')
    return users


def seed_groups():
    print('스터디 그룹 생성 중...')
    groups = []
    for name, desc, max_m, is_active in GROUP_DATA:
        group, _ = StudyGroup.objects.get_or_create(
            name=name,
            defaults={
                'description': desc,
                'max_members': max_m,
                'is_active': is_active,
            },
        )
        groups.append(group)
    print(f'  그룹 {len(groups)}개 생성 완료')
    return groups


def seed_memberships(users, groups):
    print('그룹 멤버십 생성 중...')
    memberships = {}  # (group_idx, user_idx) -> GroupMembership
    count = 0
    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        # 리더
        m, _ = GroupMembership.objects.get_or_create(
            group=group,
            user=users[leader_idx],
            defaults={'role': 'leader', 'is_active': True},
        )
        memberships[(g_idx, leader_idx)] = m
        count += 1
        # 멤버
        for u_idx in member_idxs:
            m, _ = GroupMembership.objects.get_or_create(
                group=group,
                user=users[u_idx],
                defaults={'role': 'member', 'is_active': True},
            )
            memberships[(g_idx, u_idx)] = m
            count += 1
    # edge case: 비활성 멤버십 (그룹 1의 멤버 한 명)
    if (1, 7) in memberships:
        m = memberships[(1, 7)]
        m.is_active = False
        m.save()
    print(f'  멤버십 {count}개 생성 완료')
    return memberships


def seed_attendance(users, groups):
    print('출석 세션·기록 생성 중...')
    session_count = 0
    record_count = 0

    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        leader = users[leader_idx]
        all_user_idxs = [leader_idx] + member_idxs

        # 최근 3개월치 세션 (월 3회 = 총 9회)
        for week_offset in range(12):
            session_date = TODAY - timedelta(weeks=week_offset + 1)
            if session_date.weekday() >= 5:  # 주말이면 금요일로 조정
                session_date -= timedelta(days=session_date.weekday() - 4)

            title = '' if week_offset % 4 == 0 else f'{g_idx + 1}그룹 정기 세션 #{12 - week_offset}'

            session, created = AttendanceSession.objects.get_or_create(
                group=group,
                session_date=session_date,
                defaults={'title': title, 'created_by': leader},
            )
            if not created:
                continue
            session_count += 1

            # 각 멤버 출석 기록
            for u_idx in all_user_idxs:
                user = users[u_idx]
                # 출석 패턴: 리더는 항상 출석, 멤버는 랜덤 (출석 70% / 지각 15% / 결석 15%)
                if u_idx == leader_idx:
                    status = 'present'
                elif week_offset == 0 and u_idx == member_idxs[-1]:
                    status = 'absent'  # edge case: 가장 최근 세션 마지막 멤버 결석
                else:
                    r = random.random()
                    if r < 0.70:
                        status = 'present'
                    elif r < 0.85:
                        status = 'late'
                    else:
                        status = 'absent'

                checked_at = (
                    timezone.now() - timedelta(weeks=week_offset + 1)
                    if status in ('present', 'late') else None
                )
                AttendanceRecord.objects.get_or_create(
                    session=session,
                    user=user,
                    defaults={'status': status, 'checked_at': checked_at},
                )
                record_count += 1

    print(f'  세션 {session_count}개, 출석 기록 {record_count}개 생성 완료')


def seed_penalties(users, groups):
    print('벌금 생성 중...')
    count = 0
    reasons = [
        '무단 결석', '사전 통보 없는 결석', '지각 2회 누산',
        '과제 미제출', '세션 30분 이상 지각', '연속 결석 2회',
    ]
    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        for u_idx in member_idxs:
            user = users[u_idx]
            # 이미 벌금 데이터가 있으면 건너뜀 (재실행 시 중복 방지)
            if Penalty.objects.filter(user=user, group=group).exists():
                continue
            num_penalties = random.randint(0, 3)
            for i in range(num_penalties):
                is_paid = random.choice([True, True, False])  # 납부 2:미납 1
                Penalty.objects.create(
                    user=user,
                    group=group,
                    reason=random.choice(reasons),
                    amount=random.choice([5000, 10000, 15000, 20000]),
                    is_paid=is_paid,
                )
                count += 1
    print(f'  벌금 {count}개 생성 완료')


def seed_ai_risk(users, groups):
    print('AI 출석 위험도 분석 생성 중...')
    count = 0
    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        # 그룹 전체 분석 (user=NULL) — 이력 3개, 누적 기록이므로 항상 create
        for pattern_text, risk, dropout in AI_RISK_PATTERN[:3]:
            AttendanceRiskAnalysis.objects.create(
                group=group,
                user=None,  # 그룹 전체 (리더 전용)
                risk_score=round(min(1.0, max(0.0, risk + random.uniform(-0.05, 0.05))), 3),
                dropout_probability=round(min(1.0, max(0.0, dropout + random.uniform(-0.03, 0.03))), 3),
                pattern_summary=pattern_text,
            )
            count += 1
        # 개인 분석 — 리더 포함 전 멤버 (개인 분석 없으면 AI 출석 분석 개인 탭에 데이터 없음)
        for u_idx in [leader_idx] + member_idxs:
            user = users[u_idx]
            pattern = random.choice(AI_RISK_PATTERN)
            AttendanceRiskAnalysis.objects.create(
                group=group,
                user=user,
                risk_score=round(min(1.0, max(0.0, pattern[1] + random.uniform(-0.1, 0.1))), 3),
                dropout_probability=round(min(1.0, max(0.0, pattern[2] + random.uniform(-0.05, 0.05))), 3),
                pattern_summary=pattern[0],
            )
            count += 1
    print(f'  위험도 분석 {count}개 생성 완료')


def seed_ai_monthly(users, groups):
    print('AI 월간 리포트 생성 중...')
    count = 0
    today = TODAY
    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        for month_offset in range(3):  # 최근 3개월
            target = today.replace(day=1) - timedelta(days=30 * month_offset)
            year, month = target.year, target.month
            # 그룹 보고서 (user=NULL)
            rate = random.randint(72, 95)
            sessions = random.randint(9, 13)
            avg_members = random.randint(4, 6)
            content = MONTHLY_REPORT_CONTENT_GROUP[0].format(
                year=year, month=month,
                rate=rate, sessions=sessions,
                avg_members=avg_members,
                target=min(rate + 5, 98),
            )
            MonthlyReport.objects.get_or_create(
                group=group, user=None,
                report_year=year, report_month=month,
                defaults={'content': content},
            )
            count += 1
            # 개인 보고서 — 리더 포함 전 멤버 (리더도 본인 개인 리포트 조회 가능)
            for u_idx in [leader_idx] + member_idxs:
                user = users[u_idx]
                _, nickname, _ = USER_DATA[u_idx]
                # present가 sessions를 초과하지 않도록 상한 적용
                present = min(random.randint(5, 11), sessions)
                late = min(random.randint(0, 2), sessions - present)
                absent = sessions - present - late
                personal_rate = round(present / sessions * 100) if sessions > 0 else 0
                diff = '평균 이상' if personal_rate >= rate else '평균 이하'
                personal_content = MONTHLY_REPORT_CONTENT_PERSONAL[0].format(
                    year=year, month=month,
                    rate=personal_rate,
                    present=present, late=late, absent=absent,
                    nickname=nickname, diff=diff,
                )
                MonthlyReport.objects.get_or_create(
                    group=group, user=user,
                    report_year=year, report_month=month,
                    defaults={'content': personal_content},
                )
                count += 1
    print(f'  월간 리포트 {count}개 생성 완료')


def seed_ai_goals(users, groups):
    print('AI 스터디 목표·주차별 성과 생성 중...')
    goal_count = 0
    progress_count = 0
    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        goal_template = STUDY_GOAL_DATA[g_idx]
        # 그룹 목표 (user=NULL) — get_or_create로 재실행 시 중복 방지
        group_goal, created = StudyGoal.objects.get_or_create(
            group=group,
            user=None,
            title=f'[그룹] {goal_template[0]}',
            defaults={
                'description': goal_template[1],
                'target_date': TODAY + timedelta(days=60),
                'achievement_probability': goal_template[2],
                'ai_suggestions': goal_template[3],
            },
        )
        if created:
            goal_count += 1
        for w in range(1, 9):
            _, created = WeeklyProgress.objects.get_or_create(
                goal=group_goal,
                year=TODAY.year,
                week_number=max(1, TODAY.isocalendar()[1] - (8 - w)),
                defaults={
                    'performance_score': round(min(0.95, 0.3 + w * 0.08 + random.uniform(-0.05, 0.05)), 2),
                    'summary': f'{w}주차 그룹 스터디 진행. 목표 달성률이 꾸준히 상승 중입니다.' if w % 2 == 0 else '',
                },
            )
            if created:
                progress_count += 1
        # 개인 목표 (리더 + 일부 멤버) — get_or_create로 재실행 시 중복 방지
        for u_idx in [leader_idx] + member_idxs[:2]:
            user = users[u_idx]
            _, nickname, _ = USER_DATA[u_idx]
            personal_goal, created = StudyGoal.objects.get_or_create(
                group=group,
                user=user,
                title=f'{nickname}의 개인 목표 — {goal_template[0]}',
                defaults={
                    'description': goal_template[1],
                    'target_date': TODAY + timedelta(days=random.randint(30, 90)),
                    'achievement_probability': round(
                        min(1.0, max(0.0, goal_template[2] + random.uniform(-0.15, 0.15))), 2
                    ),
                    'ai_suggestions': goal_template[3],
                },
            )
            if created:
                goal_count += 1
            for w in range(1, 6):
                _, created = WeeklyProgress.objects.get_or_create(
                    goal=personal_goal,
                    year=TODAY.year,
                    week_number=max(1, TODAY.isocalendar()[1] - (5 - w)),
                    defaults={
                        'performance_score': round(min(0.95, 0.25 + w * 0.1 + random.uniform(-0.08, 0.08)), 2),
                        'summary': f'{nickname} {w}주차 개인 진행 현황.',
                    },
                )
                if created:
                    progress_count += 1
    print(f'  스터디 목표 {goal_count}개, 주차별 성과 {progress_count}개 생성 완료')


def seed_chat_history(users, groups):
    print('AI 플래너 챗봇 이력 생성 중...')
    count = 0
    for g_idx, (leader_idx, member_idxs) in enumerate(GROUP_MEMBERS):
        group = groups[g_idx]
        for u_idx in [leader_idx] + member_idxs:
            user = users[u_idx]
            # 이미 해당 그룹·사용자 조합의 챗봇 이력이 있으면 건너뜀 (재실행 시 중복 방지)
            if PlannerChatHistory.objects.filter(group=group, user=user).exists():
                continue
            for pair in CHAT_PAIRS:
                user_msg, ai_msg = pair
                sent_base = timezone.now() - timedelta(days=random.randint(1, 30))
                PlannerChatHistory.objects.create(
                    group=group, user=user, role='user',
                    message=user_msg,
                    sent_at=sent_base,
                )
                PlannerChatHistory.objects.create(
                    group=group, user=user, role='ai',
                    message=ai_msg,
                    sent_at=sent_base + timedelta(seconds=random.randint(2, 8)),
                )
                count += 2
    print(f'  챗봇 이력 {count}개 생성 완료')


def seed_notices(users, groups):
    print('공지사항 생성 중...')
    count = 0
    for title, content, is_pinned, group_idx in NOTICE_DATA:
        if group_idx is None:
            author = users[0]  # 전체 공지 = 관리자 대리 (첫 번째 유저)
            group = None
        else:
            leader_idx = GROUP_MEMBERS[group_idx][0]
            author = users[leader_idx]
            group = groups[group_idx]
        # title + group 조합으로 중복 방지
        _, created = Notice.objects.get_or_create(
            title=title,
            group=group,
            defaults={'content': content, 'author': author, 'is_pinned': is_pinned},
        )
        if created:
            count += 1
    # 페이지네이션 테스트용 추가 공지 (그룹 1, 10개)
    for i in range(1, 11):
        _, created = Notice.objects.get_or_create(
            title=f'[웹스터디] 주간 정리 #{i}',
            group=groups[1],
            defaults={
                'content': (
                    f'이번 주 학습 내용 정리입니다.\n\n'
                    f'- 세션 {i}: 핵심 내용 복습\n'
                    f'- 다음 주 예습 범위 안내\n'
                    f'- 과제 제출 현황 확인\n\n'
                    f'모두 고생하셨습니다!'
                ),
                'author': users[GROUP_MEMBERS[1][0]],
                'is_pinned': False,
            },
        )
        if created:
            count += 1
    print(f'  공지사항 {count}개 생성 완료')


def seed_resources(users, groups):
    print('학습 자료 생성 중...')
    count = 0
    for g_idx, title, file_url in RESOURCE_DATA:
        group = groups[g_idx]
        leader_idx = GROUP_MEMBERS[g_idx][0]
        uploader = users[leader_idx]
        # group + title 조합으로 중복 방지
        _, created = Resource.objects.get_or_create(
            group=group,
            title=title,
            defaults={'file_url': file_url, 'uploaded_by': uploader},
        )
        if created:
            count += 1
    print(f'  학습 자료 {count}개 생성 완료')


def seed_calendar(users, groups):
    print('캘린더 일정 생성 중...')
    count = 0
    for g_idx, title, desc, days_offset in CALENDAR_DATA:
        group = groups[g_idx]
        leader_idx = GROUP_MEMBERS[g_idx][0]
        creator = users[leader_idx]
        event_date = TODAY + timedelta(days=days_offset)
        # group + title + event_date 조합으로 중복 방지
        _, created = CalendarEvent.objects.get_or_create(
            group=group,
            title=title,
            event_date=event_date,
            defaults={'description': desc, 'created_by': creator},
        )
        if created:
            count += 1
    print(f'  캘린더 일정 {count}개 생성 완료')


def main():
    do_clear = '--clear' in sys.argv

    print('=' * 50)
    print('StudyGroupManager 시드 데이터 생성 시작')
    print('=' * 50)

    with transaction.atomic():
        if do_clear:
            clear_data()

        random.seed(42)  # 재현 가능한 랜덤

        users  = seed_users()
        groups = seed_groups()
        seed_memberships(users, groups)
        seed_attendance(users, groups)
        seed_penalties(users, groups)
        seed_ai_risk(users, groups)
        seed_ai_monthly(users, groups)
        seed_ai_goals(users, groups)
        seed_chat_history(users, groups)
        seed_notices(users, groups)
        seed_resources(users, groups)
        seed_calendar(users, groups)

    print()
    print('=' * 50)
    print('시드 데이터 생성 완료!')
    print()
    print('[테스트 계정]')
    for username, nickname, email in USER_DATA:
        print(f'  {username:15s} / test1234!  ({nickname})')
    print()
    print('[생성 데이터 요약]')
    print(f'  사용자:           {User.objects.filter(is_superuser=False).count()}명')
    print(f'  스터디 그룹:      {StudyGroup.objects.count()}개')
    print(f'  그룹 멤버십:      {GroupMembership.objects.count()}개')
    print(f'  출석 세션:        {AttendanceSession.objects.count()}개')
    print(f'  출석 기록:        {AttendanceRecord.objects.count()}개')
    print(f'  벌금:             {Penalty.objects.count()}개')
    print(f'  위험도 분석:      {AttendanceRiskAnalysis.objects.count()}개')
    print(f'  월간 리포트:      {MonthlyReport.objects.count()}개')
    print(f'  스터디 목표:      {StudyGoal.objects.count()}개')
    print(f'  주차별 성과:      {WeeklyProgress.objects.count()}개')
    print(f'  챗봇 이력:        {PlannerChatHistory.objects.count()}개')
    print(f'  공지사항:         {Notice.objects.count()}개')
    print(f'  학습 자료:        {Resource.objects.count()}개')
    print(f'  캘린더 일정:      {CalendarEvent.objects.count()}개')
    print('=' * 50)


if __name__ == '__main__':
    main()
