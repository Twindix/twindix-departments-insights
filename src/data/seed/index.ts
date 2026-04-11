// Static seed data — accessed directly by views at runtime

export { seedDepartments, seedSubDepartments, tableAllAvg } from "./departments";
export { seedEmployees } from "./employees";
export { seedDepartmentRecords } from "./department-records";
export { seedEmployeeInsights, SHARED_CORE_COMPETENCIES } from "./employee-insights";
export { seedEmployeeCvs } from "./employee-cv";
export { seedProjects } from "./projects";
export type { ProjectInterface } from "./projects";
export { PROJECT_TYPE_META, PROJECT_NAMES_BY_TYPE, SAUDI_LOCATIONS } from "./project-names";
export { seededRandom, hashStringSeed } from "./prng";
export { getProjectCostData } from "./project-cost-data";
export type {
    CostData,
    CostInputItem,
    CostStructureItem,
    CashFlowMonth,
    ProfitabilityData,
    SensitiveIndicator,
    WasteItem,
    CostContractorItem,
    ChangeOrder,
    CostRiskItem,
    UnitCostItem,
    ExecSummaryItem,
    CostDashboardData,
} from "./project-cost-data";
export { getProjectQualityData } from "./project-quality-data";
export type {
    QualityData,
    QualityInputItem,
    QualityStructureItem,
    VillaTrackingItem,
    InspectionItem,
    DefectItem,
    QualityMaterialItem,
    QualityResourceWasteItem,
    QualityContractorItem,
    QualityRiskItem,
    HandoverItem,
    QualityDashboardData,
} from "./project-quality-data";
export { getProjectTimelineData } from "./project-timeline-data";
export type {
    TimelineData,
    TimelineUnit,
    TimelinePhase,
    TimelineUnitStatus,
    TimelinePhaseStatus,
    TimelineRiskLevel,
    TimelineMonthlyAggregation,
    TimelineMilestone,
    TimelineSummary,
    TimelineAssumption,
} from "./project-timeline-data";
