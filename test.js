/**
 * @param {integer} init
 * @return { increment: Function, decrement: Function, reset: Function }
 */
var createCounter = function(init) {
    var OG_init = init;
    

    let object = {
        increment : ()=>{
            return ++init;
        },
        decrement : ()=>{
            return --init;
        },
        reset : ()=>{
            init = OG_init;
            return init;
        }
    };
    return object;
    }


 const counter = createCounter(5);
 console.log(counter.increment(), // 6
 counter.reset(), // 5
 counter.decrement() // 4
)