export class FileUploader {
  async upload(_file: Blob, _filename: string): Promise<string> {
    throw new Error("FileUploader.upload — not implemented (Phase 2)");
  }
}
