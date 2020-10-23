
export const spawn = (worker: Worker) => {
    const callWorkerFunc = (...args: any[]) => {
        return new Promise((resolve, reject) => {
            worker.postMessage(args);
            worker.onmessage = (e) => {
                resolve(e.data);
            }
            worker.onmessageerror = (e) => {
                reject(e);
            }
            worker.onerror = (e) => {
                reject(e);
            }
        });

    }
    return callWorkerFunc;
}
