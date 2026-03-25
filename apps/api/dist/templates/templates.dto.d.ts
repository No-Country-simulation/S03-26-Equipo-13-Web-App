export declare enum TemplateCategory {
    marketing = "marketing",
    utility = "utility",
    authentication = "authentication"
}
export declare class CreateTemplateDto {
    name: string;
    content: string;
    category: TemplateCategory;
}
