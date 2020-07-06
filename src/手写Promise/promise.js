// /*
// 自定义promise函数模块
// */
(function (window) {
    const PENDING = 'pending'
    const RESOLVED = 'resolved'
    const REJECTED = 'rejected'
    // 添加一个ManualPromise的构造函数
    // 参数是一个执行器
    function ManualPromise(excutor) {
        const self = this
        self.status = 'pending' //初始化状态
        self.data = undefined //初始化数据
        self.callbacks = [] //存放元素的数组，结构{onResolved(){},onRejected(){}}，缓存回调函数
        function resolve(value) {
            if (self.status != PENDING) {
                return;
            } //判断状态，不是pending的就直接返回
            self.status = RESOLVED //修改状态
            self.data = value //保存值
            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(obj => {
                        obj.onResolved(value)
                    })
                })
            }
        }

        function reject(reason) {
            if (self.status != PENDING) {
                return;
            } //判断状态，不是pending的就直接返回
            self.status = REJECTED //修改状态
            self.data = reason //保存值
            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(obj => {
                        obj.onRejected(reason)
                    })
                })
            }
        }
        try {
            excutor(resolve, reject)
        } catch (error) {
            reject(error)
        }

    } //promise构造函数

    //then的作用：返回一个新的promise，执行回调函数，控制返回的promise的状态
    ManualPromise.prototype.then = function (onResolved, onRejected) {
        const self = this
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
                    const result = callback(self.data) //返回返回是否是promise
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
            if (self.status === RESOLVED) {
                //异步执行
               setTimeout(()=>{
                handle(onResolved)
               })
            } else if (self.status === REJECTED) {
                setTimeout(()=>{
                    handle(onRejected)
                })
        
            } else { //状态为pending，将成功或者失败的回调函数保存起来

                self.callbacks.push({
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
    ManualPromise.prototype.catch = function (onRejected) {
        return this.then(undefined, onRejected)
    }

    //promise函数对象的reject方法
    ManualPromise.reject = function (reason) {
        //返回一个失败的Promise
        return new ManualPromise((resolve, reject) => {
            reject(reason)
        })

    }

    //promise函数对象的resovle方法
    ManualPromise.resolve = function (value) {
        self = this
        //返回成功或者失败的promise
        return new ManualPromise((resolve, reject) => {
            if (value instanceof ManualPromise) { //如果是promise，那么value的结果就是新的promise返回结果
                self.data = value.data
                self.status = value.status
            } else {
                resolve(value)
            }
        })
    }

    //promise函数对象的reject方法
    ManualPromise.rejectDelay = function (reason, time) {
        if (!time) {
            time = 0
        }
        //返回一个失败的Promise
        return new ManualPromise((resolve, reject) => {
            setTimeout(() => {
                reject(reason)
            }, time)
        })

    }

    //promise函数对象的resovledelay方法
    ManualPromise.resolveDelay = function (value) {
        if (!time) {
            time = 0
        }
        self = this
        //返回成功或者失败的promise
        return new ManualPromise((resolve, reject) => {
            setTimeout(() => {
                if (value instanceof ManualPromise) { //如果是promise，那么value的结果就是新的promise返回结果
                    self.data = value.data
                    self.status = value.status
                } else {
                    resolve(value)
                }
            }, time)
        })
    }

    //promise函数对象的all方法
    ManualPromise.all = function (promises) {
        return new ManualPromise((resolve, reject) => {
            //遍历获取每个promise的结果
            if (promises.length < 1) {
                reject('不能传入空数组，此时状态为reject')
            }
            var rejectArr = promises.filter(x => x.status === REJECTED)
            if (rejectArr.length > 0) {
                if (rejectArr[0] instanceof ManualPromise) {
                    reject(rejectArr[0].data)
                } else {
                    reject(rejectArr[0])
                }

            } else {
                var dataArr = []
                promises.forEach(x => {
                    if (x instanceof ManualPromise) {
                        dataArr.push(x.data)
                    } else {
                        dataArr.push(x)
                    }

                })
                resolve(dataArr)

            }
        })
    }

    //promise函数对象的race方法
    //一旦有一个成功就成功，一旦有一个失败就失败
    //总是以第一个结果决定，因为promise只会改变一次状态
    ManualPromise.race = function (promises) {
        return new ManualPromise((resolve, reject) => {
            if (promises.length < 1) {
                reject('不能传入空数组，此时状态为reject')
            }
            if (promises[0].status === REJECTED) {
                if (promises[0] instanceof ManualPromise) {
                    reject(promises[0].data)
                } else {
                    reject(promises[0])
                }
            } else {
                if (promises[0] instanceof ManualPromise) {
                    resolve(promises[0].data)
                } else {
                    resolve(promises[0])
                }
            }
        })
    }

    //向外暴露promise函数
    window.ManualPromise = ManualPromise
})(window) //匿名立即执行函数