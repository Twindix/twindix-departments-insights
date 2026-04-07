export interface MemberInterface {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    subDepartmentId: string;
    subDepartmentName: string;
}

export interface ObjectiveInterface {
    id: number;
    kpiName: string;
    formula: string;
    targetForPeriod: number;
    relativeWeight: number;
    actualPerformance: number;
    actualAmount: number;
    notes: string;
}

export interface CompetencyRatingInterface {
    level: number;
    label: string;
    description: string;
}

export interface CompetencyInterface {
    id: number;
    name: string;
    description: string;
    levels: CompetencyRatingInterface[];
    selectedLevel: number;
    selectedLabel: string;
    score: number;
}

export interface OverallPerformanceInterface {
    competenciesWeight: number;
    indicatorsWeight: number;
    administrativeWeight: number;
    competenciesScore: number;
    indicatorsScore: number;
    administrativeScore: number;
    totalPercentage: number;
    rating: string;
    strengths: string;
    weaknesses: string;
    suggestions: string;
}

export interface EvidenceInterface {
    excellent: string;
    veryWeak: string;
}

export interface CoreCompetencyInterface {
    name: string;
    definition: string;
    levels: { level: number; description: string }[];
}

export interface MemberInsightsInterface {
    memberId: string;
    introduction: string;
    evaluationPeriod: string;
    department: string;
    objectives: ObjectiveInterface[];
    competencies: CompetencyInterface[];
    overallPerformance: OverallPerformanceInterface;
    evidence: EvidenceInterface;
    coreCompetencies: CoreCompetencyInterface[];
}
