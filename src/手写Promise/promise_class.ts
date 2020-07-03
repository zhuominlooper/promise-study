//手写class版本的ManualPromise
const  PENDING = 'pending'
const  RESOLVED = 'resolved'
const   REJECTED = 'rejected'
 class ManualPromise {
    public status :string //初始化状态
    public data :any //初始化数据,任何类型的数据
    public callbacks:Array<any> //存放元素的数组，结构{onResolved(){},onRejected(){}}，缓存回调函数
    constructor(excutor) {
         this.status = 'pending' 
         this.data = undefined 
         this.callbacks = []
        try {
            excutor(this.resolve, this.reject)
        } catch (error) {
            this.reject(error)
        }
    }
    resolve(value) {
        if (this.status != PENDING) {
            return;
        } //判断状态，不是pending的就直接返回
        this.status = RESOLVED //修改状态
        this.data = value //保存值
        if (this.callbacks.length > 0) {
            setTimeout(() => {
                this.callbacks.forEach(obj => {
                    obj.onResolved(value)
                })
            })
        }
    }

    reject(reason) {
        if (this.status != PENDING) {
            return;
        } //判断状态，不是pending的就直接返回
        this.status = REJECTED //修改状态
        console.log(222,this.status)
        console.log(2222222222,reason)
        this.data = reason //保存值
        console.log('此时', this.data )
        if (this.callbacks.length > 0) {
            setTimeout(() => {
                this.callbacks.forEach(obj => {
                    obj.onRejected(reason)
                })
            })
        }
    }

    //then的作用：返回一个新的promise，执行回调函数，控制返回的promise的状态
    then(onResolved, onRejected) {
        //指定回调函数的默认值（必须是函数）
        onResolved = typeof onResolved === 'function' ? onResolved : value => value //当回调函数不是函数时，默认是函数
        onRejected = typeof onRejected === 'function' ? onRejected : reason => {
            throw reason
        } //实现异常穿透
        //返回一个新的promise
        return new ManualPromise((resolve, reject) => {
            function handle(callback) {
                //返回的promise由执行结果由onResolved，onResolved决定
                //返回抛出异常
                //返回promise
                //返回非promise
                try {
                    const result = callback(this.data) //返回返回是否是promise
                    if (result instanceof ManualPromise) { //返回是promise
                        result.then(resolve, reject
                            // value => resolve(value),
                            // reason => reject(reason)
                        )
                    } else { //返回不是promise
                        resolve(result)
                    }
                } catch (error) { //返回抛出异常
                    reject(error)
                }
            }
            //执行指定的回调函数，根据执行结果改变返回的promise的状态
            if (this.status === RESOLVED) {
                //异步执行

                handle(onResolved)

            } else if (this.status === REJECTED) {
                handle(onRejected)

            } else { //状态为pending，将成功或者失败的回调函数保存起来

                this.callbacks.push({
                    onResolved(value) {
                        handle(onResolved)
                    },
                    onRejected(reason) {
                        handle(onRejected)
                    }
                })

            }
        })
    }
    //catch捕获异常
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    // //promise函数对象的reject方法
    // static reject(reason) {
    //     //返回一个失败的Promise
    //     return new ManualPromise((resolve, reject) => {
    //         reject(reason)
    //     })

    // }

    // //promise函数对象的resovle方法
    // static resolve = function (value) {
    //     //返回成功或者失败的promise
    //     return new ManualPromise((resolve, reject) => {
    //         if (value instanceof ManualPromise) {//如果是promise，那么value的结果就是新的promise返回结果
    //             this.data = value.data
    //             this.status = value.status
    //         }
    //         else {
    //             resolve(value)
    //         }
    //     })
    // }

    //promise函数对象的all方法
    // static all(promises) {
    //     return new ManualPromise((resolve, reject) => {
    //         //遍历获取每个promise的结果
    //         if (promises.length < 1) {
    //             reject('不能传入空数组，此时状态为reject')
    //         }
    //         var rejectArr = promises.filter(x => x.status === REJECTED)
    //         if (rejectArr.length > 0) {
    //             if (rejectArr[0] instanceof ManualPromise) {
    //                 reject(rejectArr[0].data)
    //             }
    //             else {
    //                 reject(rejectArr[0])
    //             }

    //         }
    //         else {
    //             var dataArr = []
    //             promises.forEach(x => {
    //                 if (x instanceof ManualPromise) {
    //                     dataArr.push(x.data)
    //                 }
    //                 else {
    //                     dataArr.push(x)
    //                 }

    //             })
    //             resolve(dataArr)

    //         }
    //     })
    // }

    // //promise函数对象的race方法
    // //一旦有一个成功就成功，一旦有一个失败就失败
    // //总是以第一个结果决定，因为promise只会改变一次状态
    // static race(promises) {
    //     return new ManualPromise((resolve, reject) => {
    //         if (promises.length < 1) {
    //             reject('不能传入空数组，此时状态为reject')
    //         }
    //         if (promises[0].status === REJECTED) {
    //             if (promises[0] instanceof ManualPromise) {
    //                 reject(promises[0].data)
    //             }
    //             else {
    //                 reject(promises[0])
    //             }
    //         } else {
    //             if (promises[0] instanceof ManualPromise) {
    //                 resolve(promises[0].data)
    //             }
    //             else {
    //                 resolve(promises[0])
    //             }
    //         }
    //     })
    // }

}
new ManualPromise((resolve,reject) => {
    this.resolve(2)//异步执行                
}).then(
value=>{
    console.log('onResolve1',value)
    return 644565
},
reason=>{
    console.log('onReject1',reason)
    return 644565
},
)