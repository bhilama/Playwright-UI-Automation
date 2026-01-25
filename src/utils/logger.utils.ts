export class Logger {
  static info(message: string) {
    console.log(`[INFO]: ${new Date().toString()} - ${message}`);
  }

  static warn(message: string) {
    console.warn(`[WARNING]: ${new Date().toString()} - ${message}`);
  }

  static debug(message: string) {
    console.debug(`[DEBUG]: ${new Date().toString()} - ${message}`);
  }

  static error(message: string, error?: unknown) {
    console.error(`[ERROR]: ${new Date().toString()} - ${message}`);

    if (error) {
      console.error(error);
    }
  }
}
