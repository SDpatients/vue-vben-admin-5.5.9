## 一、路径会变成 /api/v1/api/... 的 Controller（问题路径）
这些 Controller 的 @RequestMapping 以 /api 开头，导致最终路径重复：

Controller @RequestMapping 最终路径 CaseTaskController /api/case-tasks /api/v1/api/case-tasks OnlyOfficeController /api/v1/onlyoffice /api/v1/api/v1/onlyoffice LibDocumentController /api/lib/documents /api/v1/api/lib/documents LibDocumentFolderController /api/lib/folders /api/v1/api/lib/folders LibDocumentPermissionController /api/lib /api/v1/api/lib LibDocumentShareController /api/lib/shares /api/v1/api/lib/shares LibDocumentFavoriteController /api/lib/favorites /api/v1/api/lib/favorites LibDocumentStatisticsController /api/lib/statistics /api/v1/api/lib/statistics LibDocumentVersionController /api/lib /api/v1/api/lib WordTemplateController /api/template /api/v1/api/template MeetingVideoTagController /api/video-tags /api/v1/api/video-tags MeetingVoteItemController /api/vote-items /api/v1/api/vote-items ExcelImportHistoryController /api/excel-import-history /api/v1/api/excel-import-history ExcelFieldValidationRuleController /api/excel-field-validation-rules /api/v1/api/excel-field-validation-rules CaseTaskSubmissionController /api/case-task-submissions /api/v1/api/case-task-submissions CaseProcessStageController /api/case-process-stage /api/v1/api/case-process-stage

## 二、路径正确（/api/v1/...）的 Controller
这些 Controller 的 @RequestMapping 不以 /api 开头，路径正确：

Controller @RequestMapping 最终路径 BankruptCaseController /case /api/v1/case CaseSearchController /case-search /api/v1/case-search AuthController /auth /api/v1/auth UserController /users /api/v1/users RoleController /roles /api/v1/roles PermissionController /permissions /api/v1/permissions TodoController /todo /api/v1/todo FileController /file /api/v1/file ... ... ...
