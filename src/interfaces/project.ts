export type ProjectType =
    | "villas-compound"
    | "hospital"
    | "school"
    | "factory"
    | "residential-tower"
    | "mall"
    | "houses"
    | "housing-compound";

export type ProjectStatus = "completed" | "in-progress" | "early-stage" | "delayed";

export interface ProjectInterface {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    type: ProjectType;
    // Arabic label e.g. "فيلا" / "جناح" / "فصل"
    unitType: string;
    unitCount: number;
    // Saudi city / region
    location: string;
    // ISO YYYY-MM-DD
    startDate: string;
    plannedEndDate: string;
    // ISO (may differ from plannedEndDate if delayed)
    currentEndDate: string;
    status: ProjectStatus;
    contractorCount: number;
    // 0-100 percentage scores
    cost: number;
    time: number;
    quality: number;
    avgPerformance: number;
    isAccessible: boolean;
}
