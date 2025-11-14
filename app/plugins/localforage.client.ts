import localforage from "localforage";

export default defineNuxtPlugin(() => {
  console.log("PLUGIN LOADED");
  localforage.config({
    name: "lpqmTimeTracker",
    storeName: "lpqmTimeTrackerDb",
  });

  return {
    provide: {
      db: localforage,
    },
  };
});
