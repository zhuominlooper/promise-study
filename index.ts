



new Promise((resolve,reject)=>{
    console.log(111)
    resolve('promise学习了')
}).then(

    value=>console.log(value),
    error=>console.log(error)
)
console.log(222)

// const p=Promise.resolve(1)
// p.then(res=>{
//     console.log(res)
// })
