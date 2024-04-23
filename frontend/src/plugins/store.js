import { createStore } from "vuex";

export default createStore({
    state: {
        user: null,
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload;
        }
    },
    getters: {
        user(state) {
            return state.user;
        }
    },
});