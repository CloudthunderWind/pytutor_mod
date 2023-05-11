import {createRouter, createMemoryHistory} from "vue-router";


const routes = [
    {
        path: "/",
        name: "HomePage",
        displayName: "主页",
        component: () => require("../page/HomePage")
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes
});

export default router;