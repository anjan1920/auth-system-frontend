// this function adds timeout to any async call (like fetch / apiRequest)
export function withTimeout(promise, timeout = 8000) {

  return Promise.race([

    promise, // actual request

    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), timeout)
    )

  ]);
}