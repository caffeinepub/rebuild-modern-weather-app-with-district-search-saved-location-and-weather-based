declare global {
  interface Window {
    Android?: {
      showNotification(title: string, message: string, type?: string): void;
    };
  }
}

export {};
