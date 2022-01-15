class Listeners {
    private static instance: Listeners;

    private constructor() { }

    public static setInstance() {
        if (!Listeners.instance) {
            Listeners.instance = new Listeners();
        }

        return Listeners.instance;
    }
}