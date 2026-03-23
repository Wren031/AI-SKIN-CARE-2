// @/src/store/imageStore.ts
export const imageStore = {
  uri: null as string | null,
  setUri: (newUri: string) => {
    imageStore.uri = newUri;
  },
  clear: () => {
    imageStore.uri = null;
  }
};