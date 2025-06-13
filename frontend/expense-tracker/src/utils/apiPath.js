export const BASE_URL = API_CONFIG.BASE_URL;

export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/getUser",
        VERIFY_EMAIL: "/api/v1/auth/verify-email",
        RESEND_VERIFICATION: "/api/v1/auth/resend-verification",
        DELETE_ACCOUNT: "/api/v1/auth/delete-account"
    },
    DASHBOARD: {
        GET_DATA: "/api/v1/dashboard",
    },
    INCOME: {
        ADD_INCOME: "/api/v1/income/add",
        GET_ALL_INCOME: "/api/v1/income/get",
        UPDATE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
        DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
        DOWNLOAD_INCOME: `/api/v1/income/downloadexcel`,
    },
    EXPENSE: {
        ADD_EXPENSE: "/api/v1/expense/add",
        GET_ALL_EXPENSE: "/api/v1/expense/get",
        UPDATE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`, // Added this line
        DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
        DOWNLOAD_EXPENSE: `/api/v1/expense/downloadexcel`,
    },
    BUDGET: {
        GET_ALL_BUDGETS: "/api/v1/budget",
        ADD_BUDGET: "/api/v1/budget/add",
        UPDATE_BUDGET: (budgetId) => `/api/v1/budget/${budgetId}`,
        DELETE_BUDGET: (budgetId) => `/api/v1/budget/${budgetId}`,
        GET_ANALYSIS: "/api/v1/budget/analysis",
        GET_ANNUAL_ANALYSIS: "/api/v1/budget/annual-analysis"
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/v1/auth/upload-image",
    },
};