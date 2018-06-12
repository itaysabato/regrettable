
export type asyncFunctionHooks = {
    /**
     * Called right before an async function returns a its promise (retPromise).
     * If a promise (or anything else) is returned, it will replace the retPromise
     * as the return value of the async function.
     *
     * @param retPromise The promise about to be returned by the async function.
     * @param controller A unique controller object coupled with underlying async function.
     * @return A replacement promise for retPromise or undefined to keep it.
     */
    onReturn(retPromise: Promise<any>, controller: Controller): Promise<any> | undefined

    /**
     * Called when an async function pauses execution and awaits a value or a promise.
     * If a promise (or anything else) is returned, it will replace the awaitedValue as
     * the subject of awaiting.
     *
     * @param controller The unique controller object coupled with underlying async function.
     * @param awaitedValue The value or promise that will be awaited for.
     * @return A replacement promise or value for awaitedValue or undefined to keep it.
     */
    onAwait(controller: Controller, awaitedValue: any): any
}

export type Controller = {
    /**
     * Basically the same effect Generator.prototype.return has on generator functions.
     */
    return(value?): typeof value
}
