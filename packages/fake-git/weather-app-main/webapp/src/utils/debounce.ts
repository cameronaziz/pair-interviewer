const debounce = <T extends (...args: any) => any>(func: T, wait: number, immediate?: boolean): T =>{
  let timeout: NodeJS.Timeout | null;

  return function(this: T, ...args: Parameters<T>) {
      const context = this;
      const later = () => {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
      };
      const callNow = immediate && !timeout;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
  } as T
};


export default debounce;
