declare module 'pdf-extraction' {
  function extract(buffer: Buffer): Promise<{ text: string }>
  export default extract
}
