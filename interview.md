# Golang & React Interview Preparation Guide

This comprehensive guide covers essential Golang and React interview questions with detailed explanations, code examples, and helpful resources.

---

## Table of Contents

### Golang
1. [Difference between `new()` and `make()`](#1-difference-between-new-and-make)
2. [How Channels Work in Golang](#2-how-channels-work-in-golang)
3. [Concurrency Patterns](#3-concurrency-patterns)
4. [Panic and Error Handling](#4-panic-and-error-handling)
5. [REST API & Microservices](#5-rest-api--microservices)
6. [How to Implement REST API](#6-how-to-implement-rest-api)
7. [Handling Parsing Errors in Requests](#7-handling-parsing-errors-in-requests)
8. [Exception Handling & User-Friendly Errors](#8-exception-handling--user-friendly-errors)
9. [What is a Struct in Golang](#9-what-is-a-struct-in-golang)
10. [How to Secure Endpoints](#10-how-to-secure-endpoints)
11. [Identifying and Fixing Performance Issues](#11-identifying-and-fixing-performance-issues)

### React
1. [Managing State in Components](#react-1-managing-state-in-components)
2. [How useState Works](#react-2-how-usestate-works)
3. [Closures in JavaScript/React](#react-3-closures-in-javascriptreact)
4. [useEffect and Console Logging](#react-4-useeffect-and-console-logging)
5. [setTimeout and setInterval](#react-5-settimeout-and-setinterval)
6. [useRef Significance](#react-6-useref-significance)
7. [Redux vs Context API](#react-7-redux-vs-context-api)

---

# Golang Interview Questions

## 1. Difference between `new()` and `make()`

### Detailed Explanation

Both `new()` and `make()` are built-in functions in Go for memory allocation, but they serve different purposes and work with different types.

**`new(T)` Function:**
- Allocates memory for a value of type `T`
- Returns a **pointer** to a zeroed value of type `T` (`*T`)
- Works with **any type** (structs, primitives, arrays, etc.)
- The allocated memory is zero-valued
- Does NOT initialize the value, just zeros it

**`make(T, args)` Function:**
- Only works with **slices, maps, and channels**
- Returns an **initialized** (not zeroed) value of type `T` (not a pointer)
- Takes additional arguments for initialization (length, capacity)
- Actually initializes the internal data structure

### Key Differences Table

| Feature | `new()` | `make()` |
|---------|---------|----------|
| Return Type | Pointer (`*T`) | Actual type (`T`) |
| Works With | Any type | Only slices, maps, channels |
| Initialization | Zero value | Properly initialized |
| Ready to Use | Sometimes needs setup | Immediately usable |

### Code Examples

```go
package main

import "fmt"

func main() {
    // ===== Using new() =====
    
    // new with int
    p := new(int)
    fmt.Printf("new(int): value=%v, type=%T, pointer=%p\n", *p, p, p)
    // Output: new(int): value=0, type=*int, pointer=0x...
    
    // new with slice - NOT RECOMMENDED
    slicePtr := new([]int)
    fmt.Printf("new([]int): value=%v, type=%T, nil=%v\n", *slicePtr, slicePtr, *slicePtr == nil)
    // Output: new([]int): value=[], type=*[]int, nil=true
    // The slice is nil and NOT ready to use!
    
    // ===== Using make() =====
    
    // make with slice
    slice := make([]int, 5, 10) // length=5, capacity=10
    fmt.Printf("make([]int, 5, 10): value=%v, type=%T, len=%d, cap=%d\n", 
        slice, slice, len(slice), cap(slice))
    // Output: make([]int, 5, 10): value=[0 0 0 0 0], type=[]int, len=5, cap=10
    
    // make with map
    myMap := make(map[string]int)
    myMap["key"] = 100
    fmt.Printf("make(map[string]int): %v, type=%T\n", myMap, myMap)
    
    // make with channel
    ch := make(chan int, 3) // buffered channel with capacity 3
    fmt.Printf("make(chan int, 3): type=%T, cap=%d\n", ch, cap(ch))
    
    // ===== Struct Example =====
    
    type Person struct {
        Name string
        Age  int
    }
    
    // Using new - returns pointer to zero-valued struct
    person1 := new(Person)
    fmt.Printf("new(Person): %+v, type=%T\n", person1, person1)
    // Output: new(Person): &{Name: Age:0}, type=*main.Person
    
    // Using struct literal (common alternative)
    person2 := &Person{Name: "John", Age: 30}
    fmt.Printf("&Person{}: %+v, type=%T\n", person2, person2)
}
```

### Common Use Cases

```go
// Use new() when you need a pointer to a zero value
func NewCounter() *Counter {
    return new(Counter) // Returns *Counter with zero values
}

// Use make() for slices, maps, and channels
func InitializeCollections() {
    users := make([]User, 0, 100)        // Empty slice, capacity 100
    cache := make(map[string]string)      // Empty map, ready to use
    jobs := make(chan Job, 50)            // Buffered channel
}

// DON'T do this - new() creates nil map/slice/channel
wrongMap := new(map[string]int)  // *map[string]int - map is nil!
// *wrongMap["key"] = 1            // PANIC! map is nil

// DO this instead
rightMap := make(map[string]int) // map[string]int - initialized and ready
rightMap["key"] = 1               // Works perfectly
```

### Visual Memory Representation

```
new([]int):
    ptr ──→ [nil slice header]  (exists but points to nothing)

make([]int, 5):
    [slice header] ──→ [0][0][0][0][0]  (backing array allocated)
```

### Resources
- 📺 [Go new vs make - YouTube](https://www.youtube.com/watch?v=SVRYzgeZzTQ)
- 📖 [Effective Go - Allocation](https://go.dev/doc/effective_go#allocation_new)
- 📖 [Go Blog - Go Slices](https://go.dev/blog/slices-intro)

---

## 2. How Channels Work in Golang

### Detailed Explanation

Channels are Go's way of allowing goroutines (lightweight threads) to communicate with each other and synchronize their execution. They provide a **type-safe** way to send and receive values between concurrent goroutines.

**Key Concepts:**
- Channels are **typed** conduits through which you can send and receive values
- By default, sends and receives **block** until the other side is ready (synchronization)
- Channels can be **buffered** or **unbuffered**
- Channels follow the CSP (Communicating Sequential Processes) model

**Channel Types:**

1. **Unbuffered Channel:** `make(chan T)`
   - No capacity - sender blocks until receiver is ready
   - Provides strong synchronization guarantee

2. **Buffered Channel:** `make(chan T, capacity)`
   - Can hold values up to capacity
   - Sender blocks only when buffer is full
   - Receiver blocks only when buffer is empty

3. **Directional Channels:**
   - Send-only: `chan<- T`
   - Receive-only: `<-chan T`

### Code Examples

```go
package main

import (
    "fmt"
    "time"
)

// ===== Basic Channel Operations =====
func basicChannelExample() {
    // Create an unbuffered channel
    ch := make(chan string)
    
    // Send in a goroutine (must be concurrent to avoid deadlock)
    go func() {
        ch <- "Hello from goroutine!" // Send value to channel
    }()
    
    // Receive from channel (blocks until value is received)
    msg := <-ch
    fmt.Println(msg)
}

// ===== Buffered vs Unbuffered =====
func bufferedVsUnbuffered() {
    // Unbuffered - immediate blocking
    unbuffered := make(chan int)
    
    go func() {
        fmt.Println("Sending to unbuffered...")
        unbuffered <- 42 // Blocks until someone receives
        fmt.Println("Sent to unbuffered!")
    }()
    
    time.Sleep(1 * time.Second) // Simulate delay
    fmt.Println("Receiving from unbuffered:", <-unbuffered)
    
    // Buffered - can send without immediate receiver
    buffered := make(chan int, 2) // Capacity of 2
    
    buffered <- 1 // Doesn't block
    buffered <- 2 // Doesn't block
    // buffered <- 3 // Would block (buffer full)
    
    fmt.Println("Buffered values:", <-buffered, <-buffered)
}

// ===== Channel Direction (Send-only, Receive-only) =====
func channelDirection() {
    ch := make(chan int)
    
    // Send-only parameter
    go sendOnly(ch)
    
    // Receive-only parameter
    receiveOnly(ch)
}

func sendOnly(ch chan<- int) {
    ch <- 100 // Can only send
    // value := <-ch // COMPILE ERROR: cannot receive
}

func receiveOnly(ch <-chan int) {
    value := <-ch // Can only receive
    fmt.Println("Received:", value)
    // ch <- 50 // COMPILE ERROR: cannot send
}

// ===== Range and Close =====
func rangeAndClose() {
    ch := make(chan int, 5)
    
    // Producer goroutine
    go func() {
        for i := 1; i <= 5; i++ {
            ch <- i
        }
        close(ch) // Close channel when done sending
    }()
    
    // Consumer using range (automatically exits when channel closes)
    for value := range ch {
        fmt.Println("Received:", value)
    }
    
    // Check if channel is closed
    value, ok := <-ch
    fmt.Printf("After close: value=%d, ok=%t\n", value, ok)
    // Output: After close: value=0, ok=false
}

// ===== Select Statement (Multiplexing) =====
func selectExample() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "from channel 1"
    }()
    
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "from channel 2"
    }()
    
    // Select waits on multiple channel operations
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println("Received", msg1)
        case msg2 := <-ch2:
            fmt.Println("Received", msg2)
        case <-time.After(3 * time.Second):
            fmt.Println("Timeout!")
        }
    }
}

// ===== Worker Pool Pattern =====
func workerPoolExample() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    // Start 3 workers
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    
    // Send 5 jobs
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)
    
    // Collect results
    for a := 1; a <= 5; a++ {
        <-results
    }
}

func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        fmt.Printf("Worker %d started job %d\n", id, job)
        time.Sleep(time.Second)
        fmt.Printf("Worker %d finished job %d\n", id, job)
        results <- job * 2
    }
}

// ===== Nil Channel Behavior =====
func nilChannelExample() {
    var ch chan int // nil channel
    
    select {
    case <-ch:
        // Never executes (receiving from nil channel blocks forever)
        fmt.Println("Received from nil")
    case ch <- 42:
        // Never executes (sending to nil channel blocks forever)
        fmt.Println("Sent to nil")
    default:
        fmt.Println("Nil channel operations block forever")
    }
}

func main() {
    fmt.Println("=== Basic Channel ===")
    basicChannelExample()
    
    fmt.Println("\n=== Buffered vs Unbuffered ===")
    bufferedVsUnbuffered()
    
    fmt.Println("\n=== Range and Close ===")
    rangeAndClose()
    
    fmt.Println("\n=== Select ===")
    selectExample()
    
    fmt.Println("\n=== Nil Channel ===")
    nilChannelExample()
}
```

### Channel Patterns Cheat Sheet

```go
// 1. Pipeline Pattern
func pipeline() {
    // Stage 1: Generate numbers
    nums := generate(2, 3, 4)
    
    // Stage 2: Square them
    squared := square(nums)
    
    // Stage 3: Print results
    for n := range squared {
        fmt.Println(n)
    }
}

func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// 2. Fan-Out, Fan-In Pattern
func fanOutFanIn() {
    in := generate(1, 2, 3, 4)
    
    // Fan-out: multiple workers
    c1 := square(in)
    c2 := square(in)
    
    // Fan-in: merge results
    for n := range merge(c1, c2) {
        fmt.Println(n)
    }
}

func merge(cs ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    for _, c := range cs {
        wg.Add(1)
        go func(ch <-chan int) {
            defer wg.Done()
            for n := range ch {
                out <- n
            }
        }(c)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

### Important Rules

1. **Never close a channel from the receiver side** - only the sender should close
2. **Never close a channel more than once** - will cause panic
3. **Don't send on closed channel** - will cause panic
4. **Receiving from closed channel** returns zero value and `ok=false`
5. **Nil channels block forever** in send/receive operations

### Resources
- 📺 [Golang Channels Tutorial - YouTube](https://www.youtube.com/watch?v=LvgVSSpwND8)
- 📖 [Go by Example: Channels](https://gobyexample.com/channels)
- 📖 [Effective Go - Channels](https://go.dev/doc/effective_go#channels)
- 📺 [Concurrency is not Parallelism - Rob Pike](https://www.youtube.com/watch?v=oV9rvDllKEg)

---

## 3. Concurrency Patterns

### Detailed Explanation

Go's concurrency model is based on **CSP (Communicating Sequential Processes)**. Instead of sharing memory, Go encourages **communicating by sharing** using channels and goroutines.

**Key Concurrency Primitives:**
- **Goroutines:** Lightweight threads managed by Go runtime
- **Channels:** Safe communication between goroutines
- **Select:** Multiplexing channel operations
- **sync Package:** Mutexes, WaitGroups, Once, etc.

### Common Concurrency Patterns

#### 1. Worker Pool Pattern

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Job struct {
    ID     int
    Data   string
}

type Result struct {
    Job    Job
    Output string
}

// Worker Pool Pattern
func workerPool() {
    const numWorkers = 3
    jobs := make(chan Job, 10)
    results := make(chan Result, 10)
    
    // Start workers
    var wg sync.WaitGroup
    for i := 1; i <= numWorkers; i++ {
        wg.Add(1)
        go worker(i, jobs, results, &wg)
    }
    
    // Send jobs
    go func() {
        for i := 1; i <= 5; i++ {
            jobs <- Job{ID: i, Data: fmt.Sprintf("Job-%d", i)}
        }
        close(jobs)
    }()
    
    // Close results channel when all workers are done
    go func() {
        wg.Wait()
        close(results)
    }()
    
    // Collect results
    for result := range results {
        fmt.Printf("Job %d: %s\n", result.Job.ID, result.Output)
    }
}

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, job.ID)
        time.Sleep(time.Second) // Simulate work
        results <- Result{
            Job:    job,
            Output: fmt.Sprintf("Processed by worker %d", id),
        }
    }
}
```

#### 2. Pipeline Pattern

```go
// Pipeline Pattern: Chain of processing stages
func pipelinePattern() {
    // Stage 1: Generate numbers
    generator := func(nums ...int) <-chan int {
        out := make(chan int)
        go func() {
            defer close(out)
            for _, n := range nums {
                out <- n
            }
        }()
        return out
    }
    
    // Stage 2: Square numbers
    square := func(in <-chan int) <-chan int {
        out := make(chan int)
        go func() {
            defer close(out)
            for n := range in {
                out <- n * n
            }
        }()
        return out
    }
    
    // Stage 3: Add 1
    addOne := func(in <-chan int) <-chan int {
        out := make(chan int)
        go func() {
            defer close(out)
            for n := range in {
                out <- n + 1
            }
        }()
        return out
    }
    
    // Build pipeline
    nums := generator(1, 2, 3, 4)
    squared := square(nums)
    result := addOne(squared)
    
    // Consume
    for n := range result {
        fmt.Println(n) // 2, 5, 10, 17
    }
}
```

#### 3. Fan-Out, Fan-In Pattern

```go
// Fan-Out, Fan-In Pattern: Distribute work, collect results
func fanOutFanIn() {
    input := generate(1, 2, 3, 4, 5)
    
    // Fan-out: Start multiple workers
    const numWorkers = 3
    channels := make([]<-chan int, numWorkers)
    for i := 0; i < numWorkers; i++ {
        channels[i] = expensiveWork(input)
    }
    
    // Fan-in: Merge results
    results := merge(channels...)
    
    for result := range results {
        fmt.Println("Result:", result)
    }
}

func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            out <- n
        }
    }()
    return out
}

func expensiveWork(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            time.Sleep(100 * time.Millisecond) // Simulate expensive work
            out <- n * n
        }
    }()
    return out
}

func merge(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    
    // Start goroutine for each channel
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for n := range c {
                out <- n
            }
        }(ch)
    }
    
    // Close output when all inputs are exhausted
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}
```

#### 4. Timeout and Cancellation Pattern

```go
// Timeout Pattern
func timeoutPattern() {
    ch := make(chan string, 1)
    
    go func() {
        time.Sleep(2 * time.Second)
        ch <- "result"
    }()
    
    select {
    case result := <-ch:
        fmt.Println("Received:", result)
    case <-time.After(1 * time.Second):
        fmt.Println("Timeout!")
    }
}

// Context-based Cancellation
func contextCancellation() {
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()
    
    result := make(chan string)
    
    go func() {
        time.Sleep(3 * time.Second)
        result <- "done"
    }()
    
    select {
    case <-ctx.Done():
        fmt.Println("Context cancelled:", ctx.Err())
    case res := <-result:
        fmt.Println("Result:", res)
    }
}
```

#### 5. Semaphore Pattern (Rate Limiting)

```go
// Semaphore Pattern: Limit concurrent operations
func semaphorePattern() {
    const maxConcurrent = 3
    sem := make(chan struct{}, maxConcurrent)
    
    var wg sync.WaitGroup
    
    for i := 1; i <= 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            
            sem <- struct{}{}        // Acquire semaphore
            defer func() { <-sem }() // Release semaphore
            
            fmt.Printf("Task %d starting\n", id)
            time.Sleep(time.Second)
            fmt.Printf("Task %d done\n", id)
        }(i)
    }
    
    wg.Wait()
}
```

#### 6. Future/Promise Pattern

```go
// Future Pattern: Async computation with result retrieval
type Future struct {
    result chan interface{}
    err    chan error
}

func NewFuture(fn func() (interface{}, error)) *Future {
    f := &Future{
        result: make(chan interface{}, 1),
        err:    make(chan error, 1),
    }
    
    go func() {
        res, err := fn()
        if err != nil {
            f.err <- err
        } else {
            f.result <- res
        }
    }()
    
    return f
}

func (f *Future) Get() (interface{}, error) {
    select {
    case result := <-f.result:
        return result, nil
    case err := <-f.err:
        return nil, err
    }
}

func futureExample() {
    future := NewFuture(func() (interface{}, error) {
        time.Sleep(2 * time.Second)
        return "computation complete", nil
    })
    
    fmt.Println("Doing other work...")
    
    result, err := future.Get()
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Result:", result)
    }
}
```

#### 7. Done Channel Pattern

```go
// Done Channel Pattern: Graceful shutdown
func doneChannelPattern() {
    done := make(chan struct{})
    
    go func() {
        ticker := time.NewTicker(500 * time.Millisecond)
        defer ticker.Stop()
        
        for {
            select {
            case <-done:
                fmt.Println("Worker stopping...")
                return
            case <-ticker.C:
                fmt.Println("Working...")
            }
        }
    }()
    
    time.Sleep(3 * time.Second)
    close(done) // Signal shutdown
    time.Sleep(1 * time.Second)
}
```

#### 8. Or-Done Channel Pattern

```go
// Or-Done Pattern: Bridge channels with context cancellation
func orDone(ctx context.Context, ch <-chan interface{}) <-chan interface{} {
    out := make(chan interface{})
    go func() {
        defer close(out)
        for {
            select {
            case <-ctx.Done():
                return
            case val, ok := <-ch:
                if !ok {
                    return
                }
                select {
                case out <- val:
                case <-ctx.Done():
                    return
                }
            }
        }
    }()
    return out
}
```

### Synchronization Primitives

```go
import "sync"

// 1. Mutex: Mutual exclusion
type SafeCounter struct {
    mu    sync.Mutex
    count int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

// 2. RWMutex: Multiple readers or single writer
type Cache struct {
    mu   sync.RWMutex
    data map[string]string
}

func (c *Cache) Get(key string) string {
    c.mu.RLock()
    defer c.mu.RUnlock()
    return c.data[key]
}

func (c *Cache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.data[key] = value
}

// 3. WaitGroup: Wait for goroutines to finish
func waitGroupExample() {
    var wg sync.WaitGroup
    
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Println("Goroutine", id)
        }(i)
    }
    
    wg.Wait() // Wait for all goroutines
}

// 4. Once: Execute only once
var once sync.Once
var instance *Singleton

func GetInstance() *Singleton {
    once.Do(func() {
        instance = &Singleton{}
    })
    return instance
}

// 5. Pool: Reusable object pool
var bufferPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func useBuffer() {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer bufferPool.Put(buf)
    
    buf.WriteString("Hello")
    // Use buffer
    buf.Reset()
}
```

### Resources
- 📺 [Go Concurrency Patterns - Rob Pike](https://www.youtube.com/watch?v=f6kdp27TYZs)
- 📺 [Advanced Go Concurrency Patterns](https://www.youtube.com/watch?v=QDDwwePbDtw)
- 📖 [Go Concurrency Patterns Blog](https://go.dev/blog/pipelines)
- 📖 [Concurrency in Go Book](https://www.oreilly.com/library/view/concurrency-in-go/9781491941294/)

---

## 4. Panic and Error Handling

### Detailed Explanation

Go has two mechanisms for handling exceptional situations:

**Errors:**
- Normal control flow mechanism
- Explicit, expected failures
- Values that implement the `error` interface
- Should be handled at every level

**Panics:**
- For truly exceptional, unrecoverable situations
- Stops normal execution
- Can be recovered using `recover()`
- Should be rare in production code

### Error Handling

```go
package main

import (
    "errors"
    "fmt"
    "io"
    "os"
)

// ===== Basic Error Handling =====
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func basicErrorHandling() {
    result, err := divide(10, 0)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Result:", result)
}

// ===== Custom Error Types =====
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on field '%s': %s", e.Field, e.Message)
}

func validateUser(email string) error {
    if email == "" {
        return &ValidationError{
            Field:   "email",
            Message: "email is required",
        }
    }
    return nil
}

// ===== Error Wrapping (Go 1.13+) =====
func readConfig(filename string) error {
    file, err := os.Open(filename)
    if err != nil {
        return fmt.Errorf("failed to open config: %w", err)
    }
    defer file.Close()
    
    // ... parse config ...
    
    return nil
}

func errorWrapping() {
    err := readConfig("config.yaml")
    if err != nil {
        // Check for specific error
        if errors.Is(err, os.ErrNotExist) {
            fmt.Println("Config file not found")
        }
        
        // Unwrap and check underlying error
        var pathErr *os.PathError
        if errors.As(err, &pathErr) {
            fmt.Println("Path error:", pathErr.Path)
        }
        
        fmt.Println("Error:", err)
    }
}

// ===== Sentinel Errors =====
var (
    ErrNotFound     = errors.New("resource not found")
    ErrUnauthorized = errors.New("unauthorized access")
    ErrInvalidInput = errors.New("invalid input")
)

func getUser(id int) (*User, error) {
    if id <= 0 {
        return nil, ErrInvalidInput
    }
    
    // ... database lookup ...
    
    return nil, ErrNotFound
}

func sentinelErrors() {
    user, err := getUser(0)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            fmt.Println("User not found")
        } else if errors.Is(err, ErrInvalidInput) {
            fmt.Println("Invalid user ID")
        }
        return
    }
    fmt.Println("User:", user)
}

// ===== Error Checking Pattern =====
func multipleOperations() error {
    // Pattern 1: Early return
    if err := operation1(); err != nil {
        return fmt.Errorf("operation1 failed: %w", err)
    }
    
    if err := operation2(); err != nil {
        return fmt.Errorf("operation2 failed: %w", err)
    }
    
    return nil
}

// Pattern 2: Defer for cleanup
func withCleanup() error {
    resource, err := acquireResource()
    if err != nil {
        return err
    }
    defer resource.Close() // Always cleanup
    
    return useResource(resource)
}
```

### Panic and Recover

```go
// ===== When to Use Panic =====
func shouldPanic() {
    // 1. Initialization errors (can't continue)
    config := loadConfig()
    if config == nil {
        panic("configuration is required")
    }
    
    // 2. Programming errors (bugs)
    if len(slice) == 0 {
        panic("slice should never be empty here")
    }
    
    // 3. Impossible states
    switch value {
    case "a", "b", "c":
        // handle
    default:
        panic("unexpected value")
    }
}

// ===== Panic Example =====
func panicExample() {
    defer fmt.Println("This will execute even after panic")
    
    fmt.Println("Before panic")
    panic("something went wrong!")
    fmt.Println("This will NOT execute")
}

// ===== Recover from Panic =====
func recoverExample() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()
    
    fmt.Println("Starting...")
    panic("oh no!")
    fmt.Println("Won't reach here")
}

// ===== Graceful Panic Recovery in Goroutines =====
func safeGoroutine(id int) {
    defer func() {
        if r := recover(); r != nil {
            fmt.Printf("Goroutine %d panicked: %v\n", id, r)
        }
    }()
    
    // Risky operation
    if id == 3 {
        panic("goroutine 3 failed!")
    }
    
    fmt.Printf("Goroutine %d completed\n", id)
}

func recoverInGoroutines() {
    for i := 1; i <= 5; i++ {
        go safeGoroutine(i)
    }
    
    time.Sleep(time.Second)
}

// ===== HTTP Handler with Recovery =====
func safeHandler(handler http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic in handler: %v\n", err)
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            }
        }()
        
        handler(w, r)
    }
}

// ===== Converting Panic to Error =====
func riskyOperation() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic occurred: %v", r)
        }
    }()
    
    // Code that might panic
    slice := []int{1, 2, 3}
    _ = slice[10] // Will panic
    
    return nil
}

func convertPanicToError() {
    err := riskyOperation()
    if err != nil {
        fmt.Println("Caught error:", err)
    }
}
```

### Best Practices

```go
// ✅ DO: Return errors for expected failures
func (s *Service) GetUser(id string) (*User, error) {
    user, err := s.db.FindUser(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    return user, nil
}

// ✅ DO: Use errors.Is for sentinel errors
if errors.Is(err, sql.ErrNoRows) {
    // Handle not found
}

// ✅ DO: Use errors.As for error types
var netErr *net.OpError
if errors.As(err, &netErr) {
    // Handle network error
}

// ✅ DO: Wrap errors with context
return fmt.Errorf("processing user %s: %w", userID, err)

// ❌ DON'T: Ignore errors
result, _ := someFunction() // BAD

// ❌ DON'T: Panic for normal errors
if err != nil {
    panic(err) // BAD (unless initialization)
}

// ❌ DON'T: Use panic for control flow
func validateAge(age int) {
    if age < 0 {
        panic("invalid age") // BAD - use error return
    }
}

// ✅ DO: Recover in goroutines if needed
go func() {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("Goroutine panic: %v", r)
        }
    }()
    // risky code
}()
```

### Error Handling Patterns

```go
// Pattern 1: Error aggregation
type MultiError []error

func (m MultiError) Error() string {
    var msgs []string
    for _, err := range m {
        msgs = append(msgs, err.Error())
    }
    return strings.Join(msgs, "; ")
}

// Pattern 2: Retry logic
func retryOperation(maxAttempts int, operation func() error) error {
    var err error
    for attempt := 1; attempt <= maxAttempts; attempt++ {
        err = operation()
        if err == nil {
            return nil
        }
        
        log.Printf("Attempt %d failed: %v", attempt, err)
        time.Sleep(time.Second * time.Duration(attempt))
    }
    return fmt.Errorf("failed after %d attempts: %w", maxAttempts, err)
}

// Pattern 3: Error channel pattern
func processWithErrors(items []string) <-chan error {
    errs := make(chan error)
    
    go func() {
        defer close(errs)
        for _, item := range items {
            if err := process(item); err != nil {
                errs <- err
            }
        }
    }()
    
    return errs
}
```

### Resources
- 📖 [Error Handling in Go](https://go.dev/blog/error-handling-and-go)
- 📖 [Working with Errors in Go 1.13](https://go.dev/blog/go1.13-errors)
- 📺 [Errors Are Values - Rob Pike](https://www.youtube.com/watch?v=PAAkCSZUG1c)
- 📖 [Defer, Panic, and Recover](https://go.dev/blog/defer-panic-and-recover)

---

## 5. REST API & Microservices

### Detailed Explanation

**REST API (Representational State Transfer):**
- Architectural style for designing networked applications
- Uses HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Stateless client-server communication
- Resources identified by URLs
- Data typically transferred in JSON format

**Microservices:**
- Architectural pattern where application is composed of small, independent services
- Each service runs in its own process
- Services communicate via lightweight protocols (HTTP, gRPC, message queues)
- Independent deployment and scaling
- Technology diversity

### REST API Principles

```go
// REST API Key Concepts:
//
// 1. Resources: Nouns representing entities
//    - /users (collection)
//    - /users/123 (specific resource)
//    - /users/123/orders (sub-resource)
//
// 2. HTTP Methods (CRUD):
//    - GET: Retrieve resource(s)
//    - POST: Create new resource
//    - PUT: Update/Replace entire resource
//    - PATCH: Partial update
//    - DELETE: Remove resource
//
// 3. Status Codes:
//    - 200 OK: Success
//    - 201 Created: Resource created
//    - 204 No Content: Success, no body
//    - 400 Bad Request: Client error
//    - 401 Unauthorized: Authentication required
//    - 403 Forbidden: No permission
//    - 404 Not Found: Resource doesn't exist
//    - 500 Internal Server Error: Server error
//
// 4. Idempotency:
//    - GET, PUT, DELETE: Idempotent (same result on multiple calls)
//    - POST: Not idempotent (creates new resource each time)
//
// 5. Statelessness:
//    - Each request contains all necessary information
//    - No server-side session state
```

### Microservices Architecture

```go
// Microservices Characteristics:
//
// 1. Service Independence:
//    - Each service has its own database
//    - Independent deployment
//    - Loose coupling
//
// 2. Communication Patterns:
//    - Synchronous: HTTP/REST, gRPC
//    - Asynchronous: Message queues (RabbitMQ, Kafka)
//    - Service mesh: Istio, Linkerd
//
// 3. Service Discovery:
//    - Consul, Eureka, etcd
//    - DNS-based discovery
//
// 4. API Gateway:
//    - Single entry point
//    - Request routing
//    - Authentication/Authorization
//    - Rate limiting
//
// 5. Resilience Patterns:
//    - Circuit breaker
//    - Retry with exponential backoff
//    - Timeout handling
//    - Bulkhead pattern
```

### Example Microservices Architecture

```go
// Example: E-commerce System
//
// Services:
// 1. User Service (port 8081)
//    - Manages user accounts
//    - Authentication
//
// 2. Product Service (port 8082)
//    - Product catalog
//    - Inventory management
//
// 3. Order Service (port 8083)
//    - Order processing
//    - Communicates with User, Product, Payment services
//
// 4. Payment Service (port 8084)
//    - Payment processing
//    - Transaction management
//
// 5. Notification Service (port 8085)
//    - Email/SMS notifications
//    - Event-driven (listens to message queue)
//
// Communication:
// - API Gateway (port 8080) → routes to services
// - Inter-service: HTTP/REST or gRPC
// - Events: RabbitMQ/Kafka for async communication
```

### Service Communication Example

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

// ===== Service Client Pattern =====
type UserServiceClient struct {
    baseURL string
    client  *http.Client
}

func NewUserServiceClient(baseURL string) *UserServiceClient {
    return &UserServiceClient{
        baseURL: baseURL,
        client: &http.Client{
            Timeout: 10 * time.Second,
        },
    }
}

func (c *UserServiceClient) GetUser(id string) (*User, error) {
    url := fmt.Sprintf("%s/users/%s", c.baseURL, id)
    
    resp, err := c.client.Get(url)
    if err != nil {
        return nil, fmt.Errorf("failed to call user service: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("user service returned %d", resp.StatusCode)
    }
    
    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }
    
    return &user, nil
}

// ===== Circuit Breaker Pattern =====
type CircuitBreaker struct {
    maxFailures  int
    resetTimeout time.Duration
    failures     int
    lastFailTime time.Time
    state        string // "closed", "open", "half-open"
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    if cb.state == "open" {
        if time.Since(cb.lastFailTime) > cb.resetTimeout {
            cb.state = "half-open"
        } else {
            return fmt.Errorf("circuit breaker is open")
        }
    }
    
    err := fn()
    
    if err != nil {
        cb.failures++
        cb.lastFailTime = time.Now()
        
        if cb.failures >= cb.maxFailures {
            cb.state = "open"
        }
        return err
    }
    
    // Success
    cb.failures = 0
    cb.state = "closed"
    return nil
}
```

### Resources
- 📖 [Microservices Pattern](https://microservices.io/)
- 📺 [Microservices Explained](https://www.youtube.com/watch?v=CdBtNQZH8a4)
- 📖 [Building Microservices Book](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)
- 📖 [REST API Best Practices](https://restfulapi.net/)

---

## 6. How to Implement REST API

### Detailed Explanation

In Go, there are several ways to implement REST APIs. The most popular approaches are:
1. **Standard library** (`net/http`)
2. **Gin Framework** (lightweight, fast)
3. **Echo Framework** (minimalist, high performance)
4. **Chi Router** (lightweight, composable)
5. **Fiber** (Express-inspired, fast)

### Complete REST API Implementation

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "sync"
    "time"
    
    "github.com/gorilla/mux"
)

// ===== Models =====
type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

type CreateUserRequest struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

type UpdateUserRequest struct {
    Name  string `json:"name,omitempty"`
    Email string `json:"email,omitempty"`
}

type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
}

type SuccessResponse struct {
    Data    interface{} `json:"data"`
    Message string      `json:"message,omitempty"`
}

// ===== In-Memory Storage (replace with actual database) =====
type UserStore struct {
    mu      sync.RWMutex
    users   map[int]*User
    nextID  int
}

func NewUserStore() *UserStore {
    return &UserStore{
        users:  make(map[int]*User),
        nextID: 1,
    }
}

func (s *UserStore) Create(name, email string) *User {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    user := &User{
        ID:        s.nextID,
        Name:      name,
        Email:     email,
        CreatedAt: time.Now(),
    }
    
    s.users[s.nextID] = user
    s.nextID++
    
    return user
}

func (s *UserStore) GetAll() []*User {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    users := make([]*User, 0, len(s.users))
    for _, user := range s.users {
        users = append(users, user)
    }
    
    return users
}

func (s *UserStore) GetByID(id int) (*User, bool) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    user, exists := s.users[id]
    return user, exists
}

func (s *UserStore) Update(id int, name, email string) (*User, bool) {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    user, exists := s.users[id]
    if !exists {
        return nil, false
    }
    
    if name != "" {
        user.Name = name
    }
    if email != "" {
        user.Email = email
    }
    
    return user, true
}

func (s *UserStore) Delete(id int) bool {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    _, exists := s.users[id]
    if exists {
        delete(s.users, id)
    }
    
    return exists
}

// ===== Handlers =====
type UserHandler struct {
    store *UserStore
}

func NewUserHandler(store *UserStore) *UserHandler {
    return &UserHandler{store: store}
}

// GET /users - Get all users
func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
    users := h.store.GetAll()
    
    respondJSON(w, http.StatusOK, SuccessResponse{
        Data: users,
    })
}

// GET /users/{id} - Get user by ID
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondError(w, http.StatusBadRequest, "Invalid user ID")
        return
    }
    
    user, exists := h.store.GetByID(id)
    if !exists {
        respondError(w, http.StatusNotFound, "User not found")
        return
    }
    
    respondJSON(w, http.StatusOK, SuccessResponse{
        Data: user,
    })
}

// POST /users - Create new user
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    
    // Validation
    if req.Name == "" || req.Email == "" {
        respondError(w, http.StatusBadRequest, "Name and email are required")
        return
    }
    
    user := h.store.Create(req.Name, req.Email)
    
    respondJSON(w, http.StatusCreated, SuccessResponse{
        Data:    user,
        Message: "User created successfully",
    })
}

// PUT /users/{id} - Update user
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondError(w, http.StatusBadRequest, "Invalid user ID")
        return
    }
    
    var req UpdateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    
    user, exists := h.store.Update(id, req.Name, req.Email)
    if !exists {
        respondError(w, http.StatusNotFound, "User not found")
        return
    }
    
    respondJSON(w, http.StatusOK, SuccessResponse{
        Data:    user,
        Message: "User updated successfully",
    })
}

// DELETE /users/{id} - Delete user
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondError(w, http.StatusBadRequest, "Invalid user ID")
        return
    }
    
    exists := h.store.Delete(id)
    if !exists {
        respondError(w, http.StatusNotFound, "User not found")
        return
    }
    
    respondJSON(w, http.StatusOK, SuccessResponse{
        Message: "User deleted successfully",
    })
}

// ===== Middleware =====

// Logging middleware
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        log.Printf("Started %s %s", r.Method, r.URL.Path)
        
        next.ServeHTTP(w, r)
        
        log.Printf("Completed in %v", time.Since(start))
    })
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}

// Content-Type middleware
func contentTypeMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        next.ServeHTTP(w, r)
    })
}

// ===== Helper Functions =====
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(ErrorResponse{
        Error:   http.StatusText(status),
        Message: message,
    })
}

// ===== Main =====
func main() {
    // Initialize store and handler
    store := NewUserStore()
    handler := NewUserHandler(store)
    
    // Create router
    r := mux.NewRouter()
    
    // Apply global middleware
    r.Use(loggingMiddleware)
    r.Use(corsMiddleware)
    r.Use(contentTypeMiddleware)
    
    // API routes
    api := r.PathPrefix("/api/v1").Subrouter()
    
    // User endpoints
    api.HandleFunc("/users", handler.GetUsers).Methods("GET")
    api.HandleFunc("/users/{id}", handler.GetUser).Methods("GET")
    api.HandleFunc("/users", handler.CreateUser).Methods("POST")
    api.HandleFunc("/users/{id}", handler.UpdateUser).Methods("PUT")
    api.HandleFunc("/users/{id}", handler.DeleteUser).Methods("DELETE")
    
    // Health check
    api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        respondJSON(w, http.StatusOK, map[string]string{
            "status": "healthy",
        })
    }).Methods("GET")
    
    // Start server
    addr := ":8080"
    log.Printf("Server starting on %s", addr)
    
    if err := http.ListenAndServe(addr, r); err != nil {
        log.Fatal(err)
    }
}
```

### Using Gin Framework (More Popular)

```go
package main

import (
    "net/http"
    "strconv"
    "time"
    
    "github.com/gin-gonic/gin"
)

func main() {
    // Create Gin router
    router := gin.Default()
    
    // Initialize store
    store := NewUserStore()
    
    // API group
    v1 := router.Group("/api/v1")
    {
        // User routes
        users := v1.Group("/users")
        {
            users.GET("", func(c *gin.Context) {
                users := store.GetAll()
                c.JSON(http.StatusOK, gin.H{
                    "data": users,
                })
            })
            
            users.GET("/:id", func(c *gin.Context) {
                id, err := strconv.Atoi(c.Param("id"))
                if err != nil {
                    c.JSON(http.StatusBadRequest, gin.H{
                        "error": "Invalid user ID",
                    })
                    return
                }
                
                user, exists := store.GetByID(id)
                if !exists {
                    c.JSON(http.StatusNotFound, gin.H{
                        "error": "User not found",
                    })
                    return
                }
                
                c.JSON(http.StatusOK, gin.H{
                    "data": user,
                })
            })
            
            users.POST("", func(c *gin.Context) {
                var req CreateUserRequest
                
                if err := c.ShouldBindJSON(&req); err != nil {
                    c.JSON(http.StatusBadRequest, gin.H{
                        "error": err.Error(),
                    })
                    return
                }
                
                user := store.Create(req.Name, req.Email)
                
                c.JSON(http.StatusCreated, gin.H{
                    "data":    user,
                    "message": "User created successfully",
                })
            })
            
            users.PUT("/:id", func(c *gin.Context) {
                id, err := strconv.Atoi(c.Param("id"))
                if err != nil {
                    c.JSON(http.StatusBadRequest, gin.H{
                        "error": "Invalid user ID",
                    })
                    return
                }
                
                var req UpdateUserRequest
                if err := c.ShouldBindJSON(&req); err != nil {
                    c.JSON(http.StatusBadRequest, gin.H{
                        "error": err.Error(),
                    })
                    return
                }
                
                user, exists := store.Update(id, req.Name, req.Email)
                if !exists {
                    c.JSON(http.StatusNotFound, gin.H{
                        "error": "User not found",
                    })
                    return
                }
                
                c.JSON(http.StatusOK, gin.H{
                    "data":    user,
                    "message": "User updated successfully",
                })
            })
            
            users.DELETE("/:id", func(c *gin.Context) {
                id, err := strconv.Atoi(c.Param("id"))
                if err != nil {
                    c.JSON(http.StatusBadRequest, gin.H{
                        "error": "Invalid user ID",
                    })
                    return
                }
                
                exists := store.Delete(id)
                if !exists {
                    c.JSON(http.StatusNotFound, gin.H{
                        "error": "User not found",
                    })
                    return
                }
                
                c.JSON(http.StatusOK, gin.H{
                    "message": "User deleted successfully",
                })
            })
        }
        
        // Health check
        v1.GET("/health", func(c *gin.Context) {
            c.JSON(http.StatusOK, gin.H{
                "status": "healthy",
            })
        })
    }
    
    // Run server
    router.Run(":8080")
}
```

### API Testing Examples (curl)

```bash
# Get all users
curl http://localhost:8080/api/v1/users

# Get specific user
curl http://localhost:8080/api/v1/users/1

# Create user
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Update user
curl -X PUT http://localhost:8080/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}'

# Delete user
curl -X DELETE http://localhost:8080/api/v1/users/1

# Health check
curl http://localhost:8080/api/v1/health
```

### Project Structure (Best Practice)

```
project/
├── cmd/
│   └── api/
│       └── main.go          # Entry point
├── internal/
│   ├── handler/             # HTTP handlers
│   │   └── user.go
│   ├── model/               # Data models
│   │   └── user.go
│   ├── repository/          # Data access layer
│   │   └── user_repo.go
│   ├── service/             # Business logic
│   │   └── user_service.go
│   └── middleware/          # HTTP middleware
│       ├── auth.go
│       └── logging.go
├── pkg/                     # Public libraries
│   ├── response/
│   └── validator/
├── config/                  # Configuration
│   └── config.go
├── migrations/              # Database migrations
└── go.mod
```

### Resources
- 📖 [Gin Framework Docs](https://gin-gonic.com/docs/)
- 📺 [Build REST API with Go](https://www.youtube.com/watch?v=d_L64KT3SFM)
- 📖 [Go RESTful API Design](https://golang.cafe/blog/golang-rest-api-example.html)
- 📖 [Standard Package Layout](https://github.com/golang-standards/project-layout)

---

## 7. Handling Parsing Errors in Requests

### Detailed Explanation

Request parsing errors occur when the server cannot properly decode the request data. Common scenarios include:
- Invalid JSON syntax
- Missing required fields
- Type mismatches
- Validation failures
- Malformed headers

### Comprehensive Error Handling

```go
package main

import (
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "net/http"
    "strings"
    
    "github.com/gin-gonic/gin"
    "github.com/go-playground/validator/v10"
)

// ===== Request Models with Validation =====
type CreateUserRequest struct {
    Name     string `json:"name" validate:"required,min=2,max=50"`
    Email    string `json:"email" validate:"required,email"`
    Age      int    `json:"age" validate:"required,min=18,max=120"`
    Password string `json:"password" validate:"required,min=8"`
}

type ValidationError struct {
    Field   string `json:"field"`
    Message string `json:"message"`
}

type ErrorResponse struct {
    Error       string             `json:"error"`
    Message     string             `json:"message"`
    Errors      []ValidationError  `json:"errors,omitempty"`
    StatusCode  int                `json:"status_code"`
}

// ===== Validator Instance =====
var validate = validator.New()

// ===== Custom Error Types =====
var (
    ErrInvalidJSON     = errors.New("invalid JSON format")
    ErrMissingField    = errors.New("required field is missing")
    ErrInvalidValue    = errors.New("invalid field value")
    ErrBodyTooLarge    = errors.New("request body too large")
    ErrEmptyBody       = errors.New("request body is empty")
)

// ===== Parse and Validate Request =====
func parseAndValidateRequest(w http.ResponseWriter, r *http.Request, dest interface{}) error {
    // Check Content-Type
    contentType := r.Header.Get("Content-Type")
    if contentType != "application/json" {
        return fmt.Errorf("content-type must be application/json")
    }
    
    // Limit body size (prevent DOS attacks)
    r.Body = http.MaxBytesReader(w, r.Body, 1048576) // 1MB limit
    
    // Create decoder
    decoder := json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields() // Reject unknown fields
    
    // Parse JSON
    err := decoder.Decode(dest)
    if err != nil {
        return handleDecodeError(err)
    }
    
    // Check for extra data
    if decoder.More() {
        return errors.New("body must only contain a single JSON object")
    }
    
    // Validate struct
    if err := validate.Struct(dest); err != nil {
        return err
    }
    
    return nil
}

// ===== Handle Decode Errors =====
func handleDecodeError(err error) error {
    var syntaxError *json.SyntaxError
    var unmarshalTypeError *json.UnmarshalTypeError
    
    switch {
    case errors.As(err, &syntaxError):
        return fmt.Errorf("malformed JSON at position %d", syntaxError.Offset)
        
    case errors.Is(err, io.ErrUnexpectedEOF):
        return errors.New("malformed JSON")
        
    case errors.As(err, &unmarshalTypeError):
        return fmt.Errorf("invalid value for field '%s' (expected %s)",
            unmarshalTypeError.Field, unmarshalTypeError.Type)
        
    case strings.HasPrefix(err.Error(), "json: unknown field"):
        fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
        return fmt.Errorf("unknown field %s", fieldName)
        
    case errors.Is(err, io.EOF):
        return errors.New("request body is empty")
        
    case err.Error() == "http: request body too large":
        return errors.New("request body too large (max 1MB)")
        
    default:
        return err
    }
}

// ===== Convert Validation Errors to User-Friendly Messages =====
func formatValidationErrors(err error) []ValidationError {
    var validationErrors []ValidationError
    
    if validationErrs, ok := err.(validator.ValidationErrors); ok {
        for _, e := range validationErrs {
            validationErrors = append(validationErrors, ValidationError{
                Field:   strings.ToLower(e.Field()),
                Message: getErrorMessage(e),
            })
        }
    }
    
    return validationErrors
}

func getErrorMessage(e validator.FieldError) string {
    switch e.Tag() {
    case "required":
        return fmt.Sprintf("%s is required", e.Field())
    case "email":
        return "Invalid email format"
    case "min":
        return fmt.Sprintf("%s must be at least %s", e.Field(), e.Param())
    case "max":
        return fmt.Sprintf("%s must be at most %s", e.Field(), e.Param())
    case "len":
        return fmt.Sprintf("%s must be %s characters long", e.Field(), e.Param())
    case "alphanum":
        return fmt.Sprintf("%s must contain only alphanumeric characters", e.Field())
    default:
        return fmt.Sprintf("%s is invalid", e.Field())
    }
}

// ===== Standard Library Example =====
func createUserHandler(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    
    // Parse and validate
    if err := parseAndValidateRequest(w, r, &req); err != nil {
        // Check if validation error
        if validationErrs, ok := err.(validator.ValidationErrors); ok {
            respondValidationError(w, formatValidationErrors(validationErrs))
            return
        }
        
        // Other parsing errors
        respondError(w, http.StatusBadRequest, err.Error())
        return
    }
    
    // Process request...
    user := createUser(req)
    
    respondJSON(w, http.StatusCreated, map[string]interface{}{
        "data":    user,
        "message": "User created successfully",
    })
}

func respondValidationError(w http.ResponseWriter, errors []ValidationError) {
    response := ErrorResponse{
        Error:      "Validation Failed",
        Message:    "One or more fields failed validation",
        Errors:     errors,
        StatusCode: http.StatusBadRequest,
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusBadRequest)
    json.NewEncoder(w).Encode(response)
}

// ===== Gin Framework Example =====
func ginCreateUserHandler(c *gin.Context) {
    var req CreateUserRequest
    
    // Bind and validate JSON
    if err := c.ShouldBindJSON(&req); err != nil {
        // Check if validation error
        if validationErrs, ok := err.(validator.ValidationErrors); ok {
            errors := formatValidationErrors(validationErrs)
            c.JSON(http.StatusBadRequest, ErrorResponse{
                Error:      "Validation Failed",
                Message:    "One or more fields failed validation",
                Errors:     errors,
                StatusCode: http.StatusBadRequest,
            })
            return
        }
        
        // JSON parsing error
        c.JSON(http.StatusBadRequest, ErrorResponse{
            Error:      "Invalid Request",
            Message:    handleDecodeError(err).Error(),
            StatusCode: http.StatusBadRequest,
        })
        return
    }
    
    // Process request...
    user := createUser(req)
    
    c.JSON(http.StatusCreated, gin.H{
        "data":    user,
        "message": "User created successfully",
    })
}

// ===== Custom Validation Functions =====
func init() {
    // Register custom validation
    validate.RegisterValidation("username", validateUsername)
}

func validateUsername(fl validator.FieldLevel) bool {
    username := fl.Field().String()
    // Username must be alphanumeric and 3-20 characters
    if len(username) < 3 || len(username) > 20 {
        return false
    }
    
    for _, char := range username {
        if !((char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            (char >= '0' && char <= '9') ||
            char == '_') {
            return false
        }
    }
    
    return true
}

// ===== Middleware for Error Recovery =====
func errorRecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic: %v", err)
                
                respondError(w, http.StatusInternalServerError,
                    "An unexpected error occurred")
            }
        }()
        
        next.ServeHTTP(w, r)
    })
}

// ===== Example Error Responses =====
/*
Invalid JSON:
{
  "error": "Invalid Request",
  "message": "malformed JSON at position 45",
  "status_code": 400
}

Validation Errors:
{
  "error": "Validation Failed",
  "message": "One or more fields failed validation",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "age",
      "message": "Age must be at least 18"
    }
  ],
  "status_code": 400
}

Missing Field:
{
  "error": "Validation Failed",
  "message": "One or more fields failed validation",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "status_code": 400
}
*/
```

### Advanced Validation Example

```go
package main

import (
    "github.com/go-playground/validator/v10"
)

// Complex struct with nested validation
type RegistrationRequest struct {
    User    UserInfo    `json:"user" validate:"required"`
    Address AddressInfo `json:"address" validate:"required"`
    Terms   bool        `json:"terms" validate:"required,eq=true"`
}

type UserInfo struct {
    FirstName string `json:"first_name" validate:"required,min=2"`
    LastName  string `json:"last_name" validate:"required,min=2"`
    Email     string `json:"email" validate:"required,email"`
    Phone     string `json:"phone" validate:"required,e164"` // E.164 format
}

type AddressInfo struct {
    Street  string `json:"street" validate:"required"`
    City    string `json:"city" validate:"required"`
    State   string `json:"state" validate:"required,len=2"` // US state code
    ZipCode string `json:"zip_code" validate:"required,numeric,len=5"`
}

// Cross-field validation
type PasswordResetRequest struct {
    Password        string `json:"password" validate:"required,min=8"`
    ConfirmPassword string `json:"confirm_password" validate:"required,eqfield=Password"`
}
```

### Testing Error Handling

```bash
# Test invalid JSON
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{invalid json}'

# Test missing required field
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}'

# Test invalid email
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"invalid-email","age":25}'

# Test age validation
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","age":15}'
```

### Resources
- 📖 [Go Validator Package](https://github.com/go-playground/validator)
- 📖 [JSON Decoding in Go](https://go.dev/blog/json)
- 📺 [Input Validation in Go](https://www.youtube.com/watch?v=gYHJT0O7nxE)
- 📖 [Error Handling Best Practices](https://earthly.dev/blog/golang-errors/)

---

## 8. Exception Handling & User-Friendly Errors

### Detailed Explanation

Creating user-friendly error messages is crucial for good API design. Errors should:
- Be clear and descriptive
- Not expose sensitive system information
- Provide actionable feedback
- Follow consistent formatting
- Include appropriate HTTP status codes
- Log detailed errors server-side while showing simplified messages to users

### Comprehensive Error Handling System

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "runtime/debug"
    "time"
    
    "github.com/google/uuid"
)

// ===== Error Types =====
type AppError struct {
    ID          string    `json:"id"`           // Unique error ID for tracking
    Code        string    `json:"code"`         // Application-specific error code
    Message     string    `json:"message"`      // User-friendly message
    Details     string    `json:"details,omitempty"` // Additional details
    StatusCode  int       `json:"status_code"`  // HTTP status code
    Timestamp   time.Time `json:"timestamp"`
    Path        string    `json:"path"`
    InternalErr error     `json:"-"`            // Internal error (not exposed)
}

func (e *AppError) Error() string {
    return e.Message
}

// ===== Error Constructor =====
func NewAppError(statusCode int, code, message string, internalErr error) *AppError {
    return &AppError{
        ID:          uuid.New().String(),
        Code:        code,
        Message:     message,
        StatusCode:  statusCode,
        Timestamp:   time.Now(),
        InternalErr: internalErr,
    }
}

// ===== Predefined Error Types =====
var (
    // Client Errors (4xx)
    ErrBadRequest = func(message string) *AppError {
        return NewAppError(http.StatusBadRequest, "BAD_REQUEST", message, nil)
    }
    
    ErrUnauthorized = func() *AppError {
        return NewAppError(http.StatusUnauthorized, "UNAUTHORIZED",
            "Authentication required. Please log in.", nil)
    }
    
    ErrForbidden = func() *AppError {
        return NewAppError(http.StatusForbidden, "FORBIDDEN",
            "You don't have permission to access this resource.", nil)
    }
    
    ErrNotFound = func(resource string) *AppError {
        return NewAppError(http.StatusNotFound, "NOT_FOUND",
            fmt.Sprintf("%s not found.", resource), nil)
    }
    
    ErrConflict = func(message string) *AppError {
        return NewAppError(http.StatusConflict, "CONFLICT", message, nil)
    }
    
    ErrValidation = func(details string) *AppError {
        err := NewAppError(http.StatusUnprocessableEntity, "VALIDATION_ERROR",
            "The request data is invalid.", nil)
        err.Details = details
        return err
    }
    
    ErrRateLimit = func() *AppError {
        return NewAppError(http.StatusTooManyRequests, "RATE_LIMIT_EXCEEDED",
            "Too many requests. Please try again later.", nil)
    }
    
    // Server Errors (5xx)
    ErrInternal = func(internalErr error) *AppError {
        return NewAppError(http.StatusInternalServerError, "INTERNAL_ERROR",
            "An unexpected error occurred. Please try again later.", internalErr)
    }
    
    ErrServiceUnavailable = func() *AppError {
        return NewAppError(http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE",
            "Service temporarily unavailable. Please try again later.", nil)
    }
    
    ErrDatabase = func(operation string, internalErr error) *AppError {
        return NewAppError(http.StatusInternalServerError, "DATABASE_ERROR",
            fmt.Sprintf("Failed to %s. Please try again.", operation), internalErr)
    }
)

// ===== Error Response Handler =====
func HandleError(w http.ResponseWriter, r *http.Request, err error) {
    var appErr *AppError
    
    // Convert to AppError if not already
    switch e := err.(type) {
    case *AppError:
        appErr = e
    default:
        // Wrap unknown errors
        appErr = ErrInternal(err)
    }
    
    // Set request path
    appErr.Path = r.URL.Path
    
    // Log error (server-side only)
    logError(appErr)
    
    // Send user-friendly response
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(appErr.StatusCode)
    json.NewEncoder(w).Encode(appErr)
}

// ===== Error Logging =====
func logError(err *AppError) {
    if err.InternalErr != nil {
        log.Printf("[ERROR] ID: %s | Code: %s | Status: %d | Message: %s | Internal: %v",
            err.ID, err.Code, err.StatusCode, err.Message, err.InternalErr)
    } else {
        log.Printf("[ERROR] ID: %s | Code: %s | Status: %d | Message: %s",
            err.ID, err.Code, err.StatusCode, err.Message)
    }
}

// ===== Panic Recovery Middleware =====
func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                log.Printf("[PANIC] %v\n%s", rec, debug.Stack())
                
                err := &AppError{
                    ID:         uuid.New().String(),
                    Code:       "PANIC",
                    Message:    "An unexpected error occurred. Please try again.",
                    StatusCode: http.StatusInternalServerError,
                    Timestamp:  time.Now(),
                    Path:       r.URL.Path,
                }
                
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusInternalServerError)
                json.NewEncoder(w).Encode(err)
            }
        }()
        
        next.ServeHTTP(w, r)
    })
}

// ===== Example Handler Usage =====
func getUserHandler(w http.ResponseWriter, r *http.Request) {
    userID := r.URL.Query().Get("id")
    
    if userID == "" {
        HandleError(w, r, ErrBadRequest("User ID is required"))
        return
    }
    
    user, err := fetchUserFromDB(userID)
    if err != nil {
        if err == sql.ErrNoRows {
            HandleError(w, r, ErrNotFound("User"))
            return
        }
        HandleError(w, r, ErrDatabase("fetch user", err))
        return
    }
    
    // Success response
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "data": user,
    })
}

// ===== Business Logic Errors =====
type UserService struct {
    db Database
}

func (s *UserService) CreateUser(email, password string) (*User, error) {
    // Validation
    if email == "" {
        return nil, ErrBadRequest("Email is required")
    }
    
    // Check if user exists
    exists, err := s.db.UserExists(email)
    if err != nil {
        return nil, ErrDatabase("check user existence", err)
    }
    
    if exists {
        return nil, ErrConflict("A user with this email already exists")
    }
    
    // Create user
    user, err := s.db.CreateUser(email, password)
    if err != nil {
        return nil, ErrDatabase("create user", err)
    }
    
    return user, nil
}

func (s *UserService) AuthenticateUser(email, password string) (*User, error) {
    user, err := s.db.GetUserByEmail(email)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, ErrUnauthorized()
        }
        return nil, ErrDatabase("fetch user", err)
    }
    
    if !user.VerifyPassword(password) {
        return nil, ErrUnauthorized()
    }
    
    return user, nil
}

// ===== Validation Errors with Details =====
type ValidationErrors []ValidationError

func (v ValidationErrors) Error() string {
    return "Validation failed"
}

func (v ValidationErrors) ToAppError() *AppError {
    var details []string
    for _, err := range v {
        details = append(details, fmt.Sprintf("%s: %s", err.Field, err.Message))
    }
    
    return &AppError{
        ID:         uuid.New().String(),
        Code:       "VALIDATION_ERROR",
        Message:    "The request contains invalid data",
        Details:    strings.Join(details, "; "),
        StatusCode: http.StatusBadRequest,
        Timestamp:  time.Now(),
    }
}

// ===== Error Mapping for Different Audiences =====
func toPublicError(err error) *AppError {
    // Map internal errors to user-friendly messages
    switch {
    case errors.Is(err, sql.ErrNoRows):
        return ErrNotFound("Resource")
        
    case errors.Is(err, context.DeadlineExceeded):
        return NewAppError(http.StatusGatewayTimeout, "TIMEOUT",
            "Request took too long. Please try again.", err)
        
    case errors.Is(err, context.Canceled):
        return NewAppError(http.StatusRequestTimeout, "REQUEST_CANCELED",
            "Request was canceled.", err)
        
    default:
        // Don't expose internal errors
        return ErrInternal(err)
    }
}

// ===== Multi-Language Error Messages =====
type ErrorLocalizer struct {
    messages map[string]map[string]string
}

func NewErrorLocalizer() *ErrorLocalizer {
    return &ErrorLocalizer{
        messages: map[string]map[string]string{
            "NOT_FOUND": {
                "en": "Resource not found",
                "es": "Recurso no encontrado",
                "fr": "Ressource non trouvée",
            },
            "UNAUTHORIZED": {
                "en": "Please log in to continue",
                "es": "Por favor inicie sesión para continuar",
                "fr": "Veuillez vous connecter pour continuer",
            },
        },
    }
}

func (l *ErrorLocalizer) Localize(code, lang string) string {
    if messages, ok := l.messages[code]; ok {
        if message, ok := messages[lang]; ok {
            return message
        }
        return messages["en"] // Fallback to English
    }
    return "An error occurred"
}
```

### Example Error Responses

```json
// User-Friendly Not Found Error
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "NOT_FOUND",
  "message": "User not found.",
  "status_code": 404,
  "timestamp": "2026-01-26T10:30:00Z",
  "path": "/api/v1/users/123"
}

// Validation Error with Details
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "code": "VALIDATION_ERROR",
  "message": "The request data is invalid.",
  "details": "email: Invalid email format; age: Must be at least 18",
  "status_code": 422,
  "timestamp": "2026-01-26T10:31:00Z",
  "path": "/api/v1/users"
}

// Authorization Error
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "code": "FORBIDDEN",
  "message": "You don't have permission to access this resource.",
  "status_code": 403,
  "timestamp": "2026-01-26T10:32:00Z",
  "path": "/api/v1/admin/users"
}

// Internal Server Error (sanitized)
{
  "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please try again later.",
  "status_code": 500,
  "timestamp": "2026-01-26T10:33:00Z",
  "path": "/api/v1/orders"
}

// Rate Limit Error
{
  "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "status_code": 429,
  "timestamp": "2026-01-26T10:34:00Z",
  "path": "/api/v1/search"
}
```

### Best Practices Summary

```go
// ✅ DO: Provide clear, actionable messages
return ErrBadRequest("Email is required")

// ✅ DO: Hide sensitive internal errors
return ErrInternal(err) // Logs detailed error, shows generic message

// ✅ DO: Use appropriate HTTP status codes
return NewAppError(http.StatusConflict, "USER_EXISTS", "Email already registered", nil)

// ✅ DO: Include error IDs for tracking
// Users can reference error ID when contacting support

// ✅ DO: Log detailed errors server-side
log.Printf("[ERROR] Failed to connect to database: %v", err)

// ❌ DON'T: Expose stack traces or internal details
// BAD: {"error": "sql: no rows in result set at line 45 in db.go"}
// GOOD: {"message": "User not found"}

// ❌ DON'T: Use generic error messages for everything
// BAD: "An error occurred" (not helpful)
// GOOD: "Invalid email format" (specific and actionable)

// ❌ DON'T: Expose database or system information
// BAD: "SELECT failed on table users: connection refused to localhost:5432"
// GOOD: "Unable to process request. Please try again."
```

### Resources
- 📖 [Go Error Handling Best Practices](https://earthly.dev/blog/golang-errors/)
- 📖 [HTTP Status Code Guide](https://httpstatuses.com/)
- 📺 [Error Handling in Go](https://www.youtube.com/watch?v=gYHJT0O7nxE)
- 📖 [API Error Handling Best Practices](https://blog.postman.com/rest-api-error-handling-best-practices/)

---

## 9. What is a Struct in Golang

### Detailed Explanation

A **struct** is a composite data type in Go that groups together variables (called fields) under a single name. It's similar to classes in other languages but without inheritance.

**Key Characteristics:**
- User-defined type combining multiple fields
- Value type (not reference type)
- Can have methods attached
- Support for composition (embedding)
- Zero value is a struct with all fields set to their zero values
- Can be compared if all fields are comparable

### Basic Struct Usage

```go
package main

import (
    "fmt"
    "time"
)

// ===== Basic Struct Definition =====
type Person struct {
    FirstName string
    LastName  string
    Age       int
    Email     string
}

// ===== Creating Struct Instances =====
func structCreation() {
    // Method 1: Declare with zero values
    var p1 Person
    fmt.Printf("%+v\n", p1) // {FirstName: LastName: Age:0 Email:}
    
    // Method 2: Struct literal with all fields
    p2 := Person{
        FirstName: "John",
        LastName:  "Doe",
        Age:       30,
        Email:     "john@example.com",
    }
    fmt.Printf("%+v\n", p2)
    
    // Method 3: Struct literal without field names (order matters!)
    p3 := Person{"Jane", "Smith", 25, "jane@example.com"}
    fmt.Printf("%+v\n", p3)
    
    // Method 4: Pointer to struct
    p4 := &Person{
        FirstName: "Bob",
        LastName:  "Johnson",
        Age:       35,
    }
    fmt.Printf("%+v\n", p4) // &{FirstName:Bob LastName:Johnson Age:35 Email:}
    
    // Method 5: Using new (returns pointer)
    p5 := new(Person)
    p5.FirstName = "Alice"
    fmt.Printf("%+v\n", p5)
}

// ===== Struct with Tags (for JSON, validation, etc.) =====
type User struct {
    ID        int       `json:"id" db:"user_id"`
    Username  string    `json:"username" validate:"required,min=3"`
    Email     string    `json:"email" validate:"required,email"`
    Password  string    `json:"-"` // Never serialize to JSON
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at,omitempty"` // Omit if empty
}

// ===== Anonymous Structs =====
func anonymousStructs() {
    // Useful for one-off data structures
    person := struct {
        Name string
        Age  int
    }{
        Name: "John",
        Age:  30,
    }
    
    fmt.Printf("%+v\n", person)
    
    // Common in table-driven tests
    tests := []struct {
        input    int
        expected int
    }{
        {1, 2},
        {2, 4},
        {3, 6},
    }
    
    for _, test := range tests {
        result := test.input * 2
        if result != test.expected {
            fmt.Printf("Failed: expected %d, got %d\n", test.expected, result)
        }
    }
}

// ===== Nested Structs =====
type Address struct {
    Street  string
    City    string
    State   string
    ZipCode string
}

type Employee struct {
    ID      int
    Name    string
    Email   string
    Address Address // Nested struct
    Manager *Employee // Self-referencing (must be pointer)
}

func nestedStructs() {
    emp := Employee{
        ID:    1,
        Name:  "John Doe",
        Email: "john@company.com",
        Address: Address{
            Street:  "123 Main St",
            City:    "New York",
            State:   "NY",
            ZipCode: "10001",
        },
    }
    
    fmt.Printf("Employee lives in %s, %s\n", emp.Address.City, emp.Address.State)
}

// ===== Struct Embedding (Composition) =====
type Animal struct {
    Name   string
    Age    int
    Weight float64
}

func (a Animal) Speak() {
    fmt.Printf("%s makes a sound\n", a.Name)
}

type Dog struct {
    Animal // Embedded struct (anonymous field)
    Breed  string
}

func (d Dog) Bark() {
    fmt.Printf("%s barks: Woof!\n", d.Name) // Can access Animal's fields directly
}

type Cat struct {
    Animal
    Indoor bool
}

func (c Cat) Meow() {
    fmt.Printf("%s meows: Meow!\n", c.Name)
}

func embedding() {
    dog := Dog{
        Animal: Animal{
            Name:   "Rex",
            Age:    5,
            Weight: 30.5,
        },
        Breed: "German Shepherd",
    }
    
    // Access embedded fields directly
    fmt.Println(dog.Name)   // Rex
    fmt.Println(dog.Age)    // 5
    fmt.Println(dog.Breed)  // German Shepherd
    
    // Call embedded methods
    dog.Speak() // Rex makes a sound
    dog.Bark()  // Rex barks: Woof!
}

// ===== Methods on Structs =====
type Rectangle struct {
    Width  float64
    Height float64
}

// Value receiver (operates on a copy)
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// Pointer receiver (can modify the struct)
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// String method for custom printing
func (r Rectangle) String() string {
    return fmt.Sprintf("Rectangle[W:%.2f, H:%.2f]", r.Width, r.Height)
}

func methods() {
    rect := Rectangle{Width: 10, Height: 5}
    
    fmt.Println("Area:", rect.Area())       // 50
    fmt.Println("Before scale:", rect)      // Rectangle[W:10.00, H:5.00]
    
    rect.Scale(2)
    fmt.Println("After scale:", rect)       // Rectangle[W:20.00, H:10.00]
    fmt.Println("New area:", rect.Area())   // 100
}

// ===== Struct Comparison =====
type Point struct {
    X, Y int
}

func structComparison() {
    p1 := Point{X: 1, Y: 2}
    p2 := Point{X: 1, Y: 2}
    p3 := Point{X: 3, Y: 4}
    
    fmt.Println(p1 == p2) // true (all fields equal)
    fmt.Println(p1 == p3) // false
    
    // Structs with uncomparable fields (slices, maps) can't be compared
    // type User struct {
    //     Name  string
    //     Tags  []string // Slice makes User uncomparable
    // }
    // u1 == u2 // COMPILE ERROR
}

// ===== Struct with Private/Public Fields =====
type BankAccount struct {
    Owner     string  // Public (exported)
    balance   float64 // Private (unexported)
    accountID string  // Private
}

// Public method to access private field
func (ba *BankAccount) GetBalance() float64 {
    return ba.balance
}

// Public method to modify private field
func (ba *BankAccount) Deposit(amount float64) {
    if amount > 0 {
        ba.balance += amount
    }
}

func (ba *BankAccount) Withdraw(amount float64) error {
    if amount > ba.balance {
        return fmt.Errorf("insufficient funds")
    }
    ba.balance -= amount
    return nil
}

// Constructor pattern
func NewBankAccount(owner string, initialBalance float64) *BankAccount {
    return &BankAccount{
        Owner:     owner,
        balance:   initialBalance,
        accountID: generateAccountID(),
    }
}

// ===== Empty Struct =====
// Empty struct uses zero bytes of memory
type Signal struct{}

func emptyStruct() {
    // Used for signaling in channels
    done := make(chan struct{})
    
    go func() {
        // Do some work
        time.Sleep(time.Second)
        done <- struct{}{} // Send signal
    }()
    
    <-done // Wait for signal
    
    // Used in sets (map with empty struct values)
    set := make(map[string]struct{})
    set["apple"] = struct{}{}
    set["banana"] = struct{}{}
    
    _, exists := set["apple"]
    fmt.Println("Apple in set:", exists) // true
}

// ===== Struct Copying =====
func structCopying() {
    original := Person{
        FirstName: "John",
        LastName:  "Doe",
        Age:       30,
    }
    
    // Shallow copy (creates new struct with same values)
    copy := original
    copy.FirstName = "Jane"
    
    fmt.Println("Original:", original.FirstName) // John (unchanged)
    fmt.Println("Copy:", copy.FirstName)         // Jane
    
    // Working with pointers
    ptr1 := &Person{FirstName: "Bob"}
    ptr2 := ptr1 // Both point to same struct
    
    ptr2.FirstName = "Alice"
    fmt.Println("Via ptr1:", ptr1.FirstName) // Alice (both changed)
}

// ===== Complex Example: Struct with Multiple Concerns =====
type Order struct {
    ID         string
    CustomerID string
    Items      []OrderItem
    Total      float64
    Status     OrderStatus
    CreatedAt  time.Time
    UpdatedAt  time.Time
}

type OrderItem struct {
    ProductID string
    Quantity  int
    Price     float64
}

type OrderStatus string

const (
    OrderStatusPending   OrderStatus = "pending"
    OrderStatusConfirmed OrderStatus = "confirmed"
    OrderStatusShipped   OrderStatus = "shipped"
    OrderStatusDelivered OrderStatus = "delivered"
    OrderStatusCancelled OrderStatus = "cancelled"
)

func (o *Order) AddItem(productID string, quantity int, price float64) {
    item := OrderItem{
        ProductID: productID,
        Quantity:  quantity,
        Price:     price,
    }
    o.Items = append(o.Items, item)
    o.CalculateTotal()
}

func (o *Order) CalculateTotal() {
    total := 0.0
    for _, item := range o.Items {
        total += float64(item.Quantity) * item.Price
    }
    o.Total = total
}

func (o *Order) UpdateStatus(status OrderStatus) {
    o.Status = status
    o.UpdatedAt = time.Now()
}

func (o Order) IsCompleted() bool {
    return o.Status == OrderStatusDelivered || o.Status == OrderStatusCancelled
}
```

### Struct Best Practices

```go
// ✅ DO: Use pointer receivers for methods that modify struct
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// ✅ DO: Use value receivers for small, immutable structs
func (p Point) Distance() float64 {
    return math.Sqrt(float64(p.X*p.X + p.Y*p.Y))
}

// ✅ DO: Use constructor functions for complex initialization
func NewUser(username, email string) *User {
    return &User{
        ID:        generateID(),
        Username:  username,
        Email:     email,
        CreatedAt: time.Now(),
    }
}

// ✅ DO: Use struct tags for JSON, validation, etc.
type Product struct {
    ID    int     `json:"id" db:"product_id"`
    Name  string  `json:"name" validate:"required"`
    Price float64 `json:"price" validate:"gt=0"`
}

// ✅ DO: Use composition over inheritance
type Manager struct {
    Employee  // Embed Employee
    TeamSize int
}

// ❌ DON'T: Mix pointer and value receivers arbitrarily
// Be consistent: use one or the other

// ❌ DON'T: Create huge structs with too many responsibilities
// Break into smaller, focused structs

// ❌ DON'T: Export fields that should be private
type User struct {
    password string // Good - private
    // Password string // Bad - public
}
```

### Resources
- 📖 [Effective Go - Structs](https://go.dev/doc/effective_go#composite_literals)
- 📺 [Go Structs Tutorial](https://www.youtube.com/watch?v=bv_JGMWYz_c)
- 📖 [Go by Example: Structs](https://gobyexample.com/structs)
- 📖 [Composition over Inheritance in Go](https://golangbot.com/inheritance/)

---

## 10. How to Secure Endpoints

### Detailed Explanation

API security is crucial for protecting sensitive data and preventing unauthorized access. Key security measures include:
- **Authentication:** Verifying user identity (JWT, OAuth, API Keys)
- **Authorization:** Checking user permissions
- **Input Validation:** Preventing injection attacks
- **Rate Limiting:** Preventing abuse
- **HTTPS:** Encrypting data in transit
- **CORS:** Controlling cross-origin requests
- **Security Headers:** Protecting against common vulnerabilities

### Complete Security Implementation

```go
package main

import (
    "context"
    "crypto/subtle"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strings"
    "time"
    
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "golang.org/x/time/rate"
)

// ===== 1. JWT Authentication =====

var jwtSecret = []byte("your-secret-key-change-in-production")

type Claims struct {
    UserID   string   `json:"user_id"`
    Username string   `json:"username"`
    Roles    []string `json:"roles"`
    jwt.RegisteredClaims
}

// Generate JWT token
func generateToken(userID, username string, roles []string) (string, error) {
    claims := &Claims{
        UserID:   userID,
        Username: username,
        Roles:    roles,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "myapp",
        },
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

// Validate JWT token
func validateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return jwtSecret, nil
    })
    
    if err != nil {
        return nil, err
    }
    
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    
    return nil, fmt.Errorf("invalid token")
}

// ===== 2. Authentication Middleware =====

type contextKey string

const userContextKey contextKey = "user"

func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Extract token from Authorization header
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Missing authorization header", http.StatusUnauthorized)
            return
        }
        
        // Check Bearer token format
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
            return
        }
        
        tokenString := parts[1]
        
        // Validate token
        claims, err := validateToken(tokenString)
        if err != nil {
            http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
            return
        }
        
        // Add claims to context
        ctx := context.WithValue(r.Context(), userContextKey, claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// Helper to get user from context
func getUserFromContext(r *http.Request) (*Claims, error) {
    claims, ok := r.Context().Value(userContextKey).(*Claims)
    if !ok {
        return nil, fmt.Errorf("user not found in context")
    }
    return claims, nil
}

// ===== 3. Role-Based Authorization =====

func requireRole(roles ...string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            claims, err := getUserFromContext(r)
            if err != nil {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            
            // Check if user has required role
            hasRole := false
            for _, role := range roles {
                for _, userRole := range claims.Roles {
                    if role == userRole {
                        hasRole = true
                        break
                    }
                }
            }
            
            if !hasRole {
                http.Error(w, "Forbidden: insufficient permissions", http.StatusForbidden)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}

// ===== 4. API Key Authentication =====

type APIKeyStore struct {
    keys map[string]APIKey
}

type APIKey struct {
    UserID      string
    Permissions []string
    ExpiresAt   time.Time
}

func (s *APIKeyStore) Validate(key string) (*APIKey, bool) {
    apiKey, exists := s.keys[key]
    if !exists {
        return nil, false
    }
    
    // Check expiration
    if time.Now().After(apiKey.ExpiresAt) {
        return nil, false
    }
    
    return &apiKey, true
}

func apiKeyMiddleware(store *APIKeyStore) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            apiKey := r.Header.Get("X-API-Key")
            if apiKey == "" {
                http.Error(w, "Missing API key", http.StatusUnauthorized)
                return
            }
            
            key, valid := store.Validate(apiKey)
            if !valid {
                http.Error(w, "Invalid API key", http.StatusUnauthorized)
                return
            }
            
            ctx := context.WithValue(r.Context(), "apiKey", key)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// ===== 5. Rate Limiting =====

// Per-IP rate limiter
type IPRateLimiter struct {
    limiters map[string]*rate.Limiter
    mu       sync.RWMutex
    rate     rate.Limit
    burst    int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
    return &IPRateLimiter{
        limiters: make(map[string]*rate.Limiter),
        rate:     r,
        burst:    b,
    }
}

func (i *IPRateLimiter) getLimiter(ip string) *rate.Limiter {
    i.mu.Lock()
    defer i.mu.Unlock()
    
    limiter, exists := i.limiters[ip]
    if !exists {
        limiter = rate.NewLimiter(i.rate, i.burst)
        i.limiters[ip] = limiter
    }
    
    return limiter
}

func (i *IPRateLimiter) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr
        limiter := i.getLimiter(ip)
        
        if !limiter.Allow() {
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}

// ===== 6. Security Headers Middleware =====

func securityHeadersMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Prevent clickjacking
        w.Header().Set("X-Frame-Options", "DENY")
        
        // Prevent MIME type sniffing
        w.Header().Set("X-Content-Type-Options", "nosniff")
        
        // Enable XSS protection
        w.Header().Set("X-XSS-Protection", "1; mode=block")
        
        // Content Security Policy
        w.Header().Set("Content-Security-Policy", "default-src 'self'")
        
        // Referrer Policy
        w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
        
        // Permissions Policy
        w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        
        // HSTS (only if using HTTPS)
        if r.TLS != nil {
            w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        }
        
        next.ServeHTTP(w, r)
    })
}

// ===== 7. CORS Configuration =====

func corsMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            origin := r.Header.Get("Origin")
            
            // Check if origin is allowed
            allowed := false
            for _, allowedOrigin := range allowedOrigins {
                if origin == allowedOrigin {
                    allowed = true
                    break
                }
            }
            
            if allowed {
                w.Header().Set("Access-Control-Allow-Origin", origin)
                w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
                w.Header().Set("Access-Control-Max-Age", "86400")
            }
            
            if r.Method == "OPTIONS" {
                w.WriteHeader(http.StatusOK)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}

// ===== 8. Input Validation & Sanitization =====

func validateInput(input string) error {
    // Check for SQL injection patterns
    sqlPatterns := []string{"'", "--", ";", "/*", "*/", "xp_", "sp_", "UNION", "SELECT", "DROP"}
    
    for _, pattern := range sqlPatterns {
        if strings.Contains(strings.ToUpper(input), pattern) {
            return fmt.Errorf("invalid input: potential SQL injection")
        }
    }
    
    // Check for XSS patterns
    xssPatterns := []string{"<script>", "</script>", "javascript:", "onerror=", "onload="}
    
    for _, pattern := range xssPatterns {
        if strings.Contains(strings.ToLower(input), pattern) {
            return fmt.Errorf("invalid input: potential XSS attack")
        }
    }
    
    return nil
}

// ===== 9. Password Hashing =====

func hashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

func checkPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// ===== 10. Login Handler (Complete Example) =====

type LoginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

type LoginResponse struct {
    Token     string    `json:"token"`
    ExpiresAt time.Time `json:"expires_at"`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }
    
    // Validate input
    if err := validateInput(req.Username); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Fetch user from database (example)
    user, err := getUserByUsername(req.Username)
    if err != nil {
        // Use constant-time comparison to prevent timing attacks
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }
    
    // Verify password
    if !checkPassword(req.Password, user.PasswordHash) {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }
    
    // Generate token
    token, err := generateToken(user.ID, user.Username, user.Roles)
    if err != nil {
        http.Error(w, "Failed to generate token", http.StatusInternalServerError)
        return
    }
    
    // Return token
    response := LoginResponse{
        Token:     token,
        ExpiresAt: time.Now().Add(24 * time.Hour),
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// ===== 11. Protected Endpoint Example =====

func protectedHandler(w http.ResponseWriter, r *http.Request) {
    claims, err := getUserFromContext(r)
    if err != nil {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
    
    response := map[string]interface{}{
        "message": "Access granted",
        "user":    claims.Username,
        "roles":   claims.Roles,
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// ===== 12. Main Setup with All Security Measures =====

func main() {
    mux := http.NewServeMux()
    
    // Public endpoints (no auth required)
    mux.HandleFunc("/api/login", loginHandler)
    mux.HandleFunc("/api/register", registerHandler)
    
    // Protected endpoints
    protected := http.NewServeMux()
    protected.HandleFunc("/api/users", usersHandler)
    protected.HandleFunc("/api/profile", profileHandler)
    
    // Admin endpoints
    admin := http.NewServeMux()
    admin.HandleFunc("/api/admin/users", adminUsersHandler)
    
    // Apply middleware chain
    rateLimiter := NewIPRateLimiter(rate.Limit(10), 20) // 10 requests/sec, burst of 20
    
    // Public routes with rate limiting
    publicChain := rateLimiter.Middleware(
        securityHeadersMiddleware(
            corsMiddleware([]string{"https://example.com"})(mux),
        ),
    )
    
    // Protected routes with auth
    protectedChain := rateLimiter.Middleware(
        securityHeadersMiddleware(
            corsMiddleware([]string{"https://example.com"})(
                authMiddleware(protected),
            ),
        ),
    )
    
    // Admin routes with auth + role check
    adminChain := rateLimiter.Middleware(
        securityHeadersMiddleware(
            corsMiddleware([]string{"https://example.com"})(
                authMiddleware(
                    requireRole("admin")(admin),
                ),
            ),
        ),
    )
    
    // Combined router
    http.Handle("/", publicChain)
    http.Handle("/api/users", protectedChain)
    http.Handle("/api/admin/", adminChain)
    
    // Start HTTPS server (in production)
    log.Println("Server starting on :8443")
    log.Fatal(http.ListenAndServeTLS(":8443", "cert.pem", "key.pem", nil))
    
    // For development (HTTP)
    // log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### Security Checklist

```
✅ Authentication
   - Use JWT or OAuth 2.0
   - Implement token expiration and refresh
   - Use secure password hashing (bcrypt)

✅ Authorization
   - Implement role-based access control (RBAC)
   - Validate permissions on every request
   - Follow principle of least privilege

✅ Input Validation
   - Validate all user input
   - Sanitize data to prevent injection attacks
   - Use parameterized queries for database access

✅ Rate Limiting
   - Implement per-IP and per-user rate limits
   - Protect against brute force attacks
   - Add CAPTCHA for sensitive operations

✅ HTTPS/TLS
   - Always use HTTPS in production
   - Use valid SSL/TLS certificates
   - Enable HSTS header

✅ Security Headers
   - X-Frame-Options
   - X-Content-Type-Options
   - Content-Security-Policy
   - X-XSS-Protection

✅ CORS
   - Configure allowed origins properly
   - Don't use wildcard (*) in production
   - Validate Origin header

✅ Logging & Monitoring
   - Log authentication attempts
   - Monitor for suspicious activity
   - Alert on security events

✅ API Keys (if applicable)
   - Generate strong, random keys
   - Implement key expiration
   - Allow key revocation

✅ Error Handling
   - Don't expose sensitive information
   - Use generic error messages
   - Log detailed errors server-side only
```

### Resources
- 📖 [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- 📺 [JWT Authentication in Go](https://www.youtube.com/watch?v=ma7rUS_vW9M)
- 📖 [Go Security Best Practices](https://github.com/guardrails/awesome-golang-security)
- 📖 [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)

---

## 11. Identifying and Fixing Performance Issues

### Detailed Explanation

Performance optimization is critical for scalable applications. Key areas to focus on:
- **Profiling:** Identifying bottlenecks
- **Benchmarking:** Measuring performance
- **Memory Management:** Reducing allocations
- **Concurrency:** Efficient use of goroutines
- **Database:** Query optimization
- **Caching:** Reducing redundant operations

### Performance Profiling Tools

```go
package main

import (
    "fmt"
    "log"
    "net/http"
    _ "net/http/pprof" // Import for side effects
    "runtime"
    "runtime/pprof"
    "os"
    "time"
)

// ===== 1. Enable pprof for HTTP Server =====

func startProfilingServer() {
    // Pprof endpoints automatically registered at:
    // - /debug/pprof/
    // - /debug/pprof/cmdline
    // - /debug/pprof/profile (30-second CPU profile)
    // - /debug/pprof/heap
    // - /debug/pprof/goroutine
    // - /debug/pprof/threadcreate
    // - /debug/pprof/block
    
    go func() {
        log.Println("Profiling server starting on :6060")
        log.Println(http.ListenAndServe("localhost:6060", nil))
    }()
}

// Access profiles:
// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
// go tool pprof http://localhost:6060/debug/pprof/heap
// go tool pprof http://localhost:6060/debug/pprof/goroutine

// ===== 2. CPU Profiling =====

func profileCPU(outputFile string, fn func()) {
    f, err := os.Create(outputFile)
    if err != nil {
        log.Fatal(err)
    }
    defer f.Close()
    
    // Start CPU profiling
    if err := pprof.StartCPUProfile(f); err != nil {
        log.Fatal(err)
    }
    defer pprof.StopCPUProfile()
    
    // Run function to profile
    fn()
}

// Analyze: go tool pprof cpu.prof
// Interactive commands:
//   top - show top functions
//   list <function> - show source code
//   web - generate graph (requires graphviz)

// ===== 3. Memory Profiling =====

func profileMemory(outputFile string, fn func()) {
    // Run function
    fn()
    
    // Force garbage collection
    runtime.GC()
    
    f, err := os.Create(outputFile)
    if err != nil {
        log.Fatal(err)
    }
    defer f.Close()
    
    // Write heap profile
    if err := pprof.WriteHeapProfile(f); err != nil {
        log.Fatal(err)
    }
}

// Analyze: go tool pprof mem.prof
// Commands:
//   top - memory allocations
//   list <function> - allocation points
//   inuse_space - currently allocated memory
//   alloc_space - total allocated memory

// ===== 4. Goroutine Profiling =====

func profileGoroutines() {
    // Get number of goroutines
    numGoroutines := runtime.NumGoroutine()
    fmt.Printf("Number of goroutines: %d\n", numGoroutines)
    
    // Write goroutine profile
    f, _ := os.Create("goroutine.prof")
    defer f.Close()
    pprof.Lookup("goroutine").WriteTo(f, 1)
}

// ===== 5. Benchmarking =====

// Benchmark file: example_test.go
/*
package main

import "testing"

func BenchmarkStringConcatenation(b *testing.B) {
    b.ReportAllocs() // Report memory allocations
    
    for i := 0; i < b.N; i++ {
        result := ""
        for j := 0; j < 100; j++ {
            result += "x"
        }
    }
}

func BenchmarkStringBuilder(b *testing.B) {
    b.ReportAllocs()
    
    for i := 0; i < b.N; i++ {
        var sb strings.Builder
        for j := 0; j < 100; j++ {
            sb.WriteString("x")
        }
        _ = sb.String()
    }
}

// Run: go test -bench=. -benchmem
// Compare: benchstat old.txt new.txt
*/

// ===== 6. Common Performance Issues =====

// ❌ BAD: String concatenation in loop
func inefficientStringConcat() string {
    result := ""
    for i := 0; i < 1000; i++ {
        result += "x" // Creates new string each iteration!
    }
    return result
}

// ✅ GOOD: Use strings.Builder
func efficientStringConcat() string {
    var sb strings.Builder
    sb.Grow(1000) // Pre-allocate
    for i := 0; i < 1000; i++ {
        sb.WriteString("x")
    }
    return sb.String()
}

// ❌ BAD: Slice reallocation
func inefficientSliceAppend() []int {
    var slice []int
    for i := 0; i < 10000; i++ {
        slice = append(slice, i) // May reallocate multiple times
    }
    return slice
}

// ✅ GOOD: Pre-allocate slice
func efficientSliceAppend() []int {
    slice := make([]int, 0, 10000) // Pre-allocate capacity
    for i := 0; i < 10000; i++ {
        slice = append(slice, i)
    }
    return slice
}

// ❌ BAD: Creating goroutines without limit
func inefficientGoroutines(items []int) {
    for _, item := range items {
        go processItem(item) // Could create millions of goroutines!
    }
}

// ✅ GOOD: Worker pool pattern
func efficientGoroutines(items []int) {
    const numWorkers = 10
    jobs := make(chan int, 100)
    
    // Start workers
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for item := range jobs {
                processItem(item)
            }
        }()
    }
    
    // Send jobs
    for _, item := range items {
        jobs <- item
    }
    close(jobs)
    
    wg.Wait()
}

// ❌ BAD: Unnecessary mutex locking
type BadCounter struct {
    mu    sync.Mutex
    count int
}

func (c *BadCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.count++
}

func (c *BadCounter) Get() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.count
}

// ✅ GOOD: Use atomic operations
type GoodCounter struct {
    count int64
}

func (c *GoodCounter) Increment() {
    atomic.AddInt64(&c.count, 1)
}

func (c *GoodCounter) Get() int64 {
    return atomic.LoadInt64(&c.count)
}

// ❌ BAD: No connection pooling
func badDatabaseQuery() {
    db, _ := sql.Open("postgres", "connection-string")
    defer db.Close() // Opens new connection each time!
    
    // Query...
}

// ✅ GOOD: Use connection pool
var dbPool *sql.DB

func init() {
    dbPool, _ = sql.Open("postgres", "connection-string")
    dbPool.SetMaxOpenConns(25)
    dbPool.SetMaxIdleConns(5)
    dbPool.SetConnMaxLifetime(5 * time.Minute)
}

func goodDatabaseQuery() {
    // Reuses connection from pool
    row := dbPool.QueryRow("SELECT * FROM users WHERE id = $1", 1)
    // ...
}

// ===== 7. Caching Strategies =====

// In-memory cache with expiration
type Cache struct {
    mu    sync.RWMutex
    items map[string]cacheItem
}

type cacheItem struct {
    value      interface{}
    expiration time.Time
}

func NewCache() *Cache {
    c := &Cache{
        items: make(map[string]cacheItem),
    }
    
    // Start cleanup goroutine
    go c.cleanup()
    
    return c
}

func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    c.items[key] = cacheItem{
        value:      value,
        expiration: time.Now().Add(duration),
    }
}

func (c *Cache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    
    item, exists := c.items[key]
    if !exists {
        return nil, false
    }
    
    if time.Now().After(item.expiration) {
        return nil, false
    }
    
    return item.value, true
}

func (c *Cache) cleanup() {
    ticker := time.NewTicker(1 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        c.mu.Lock()
        for key, item := range c.items {
            if time.Now().After(item.expiration) {
                delete(c.items, key)
            }
        }
        c.mu.Unlock()
    }
}

// ===== 8. Database Query Optimization =====

// ❌ BAD: N+1 query problem
func badGetUsersWithOrders() {
    users := getAllUsers() // 1 query
    
    for _, user := range users {
        orders := getOrdersByUserID(user.ID) // N queries!
        user.Orders = orders
    }
}

// ✅ GOOD: Use JOIN or batch fetch
func goodGetUsersWithOrders() {
    query := `
        SELECT u.*, o.*
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
    `
    
    // Single query with JOIN
    rows, _ := db.Query(query)
    // Parse results...
}

// ✅ GOOD: Use prepared statements
func usePreparedStatements(userIDs []int) {
    stmt, _ := db.Prepare("SELECT * FROM users WHERE id = $1")
    defer stmt.Close()
    
    for _, id := range userIDs {
        row := stmt.QueryRow(id) // Reuses prepared statement
        // ...
    }
}

// ===== 9. Monitoring Metrics =====

type Metrics struct {
    requestCount    int64
    errorCount      int64
    totalDuration   int64
    activeRequests  int64
}

func (m *Metrics) RecordRequest(duration time.Duration, isError bool) {
    atomic.AddInt64(&m.requestCount, 1)
    atomic.AddInt64(&m.totalDuration, int64(duration))
    
    if isError {
        atomic.AddInt64(&m.errorCount, 1)
    }
}

func (m *Metrics) GetStats() map[string]interface{} {
    reqCount := atomic.LoadInt64(&m.requestCount)
    errCount := atomic.LoadInt64(&m.errorCount)
    totalDur := atomic.LoadInt64(&m.totalDuration)
    
    avgDuration := time.Duration(0)
    if reqCount > 0 {
        avgDuration = time.Duration(totalDur / reqCount)
    }
    
    return map[string]interface{}{
        "total_requests":   reqCount,
        "error_count":      errCount,
        "average_duration": avgDuration.String(),
        "error_rate":       float64(errCount) / float64(reqCount),
    }
}

// Middleware to track metrics
func metricsMiddleware(metrics *Metrics) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            atomic.AddInt64(&metrics.activeRequests, 1)
            defer atomic.AddInt64(&metrics.activeRequests, -1)
            
            // Wrap response writer to capture status code
            wrapped := &responseWriter{ResponseWriter: w, statusCode: 200}
            
            next.ServeHTTP(wrapped, r)
            
            duration := time.Since(start)
            isError := wrapped.statusCode >= 400
            
            metrics.RecordRequest(duration, isError)
        })
    }
}
```

### Performance Optimization Checklist

```
✅ Profiling
   - Use pprof for CPU and memory profiling
   - Identify hotspots and bottlenecks
   - Monitor goroutine leaks

✅ Memory
   - Pre-allocate slices with known capacity
   - Use sync.Pool for frequently allocated objects
   - Avoid unnecessary string concatenation
   - Minimize interface{} usage

✅ Concurrency
   - Use worker pools instead of unlimited goroutines
   - Use buffered channels appropriately
   - Avoid excessive mutex contention
   - Use atomic operations when possible

✅ Database
   - Use connection pooling
   - Optimize queries (avoid N+1 problems)
   - Use indexes properly
   - Use prepared statements
   - Implement caching

✅ HTTP
   - Use keep-alive connections
   - Enable compression
   - Set appropriate timeouts
   - Use connection pooling for HTTP clients

✅ Algorithms
   - Choose appropriate data structures
   - Avoid nested loops when possible
   - Use binary search instead of linear search
   - Consider time/space tradeoffs

✅ Monitoring
   - Track key metrics (latency, throughput, errors)
   - Set up alerts for anomalies
   - Use distributed tracing
   - Monitor resource usage (CPU, memory, disk)
```

### Tools and Commands

```bash
# CPU Profiling
go test -cpuprofile=cpu.prof -bench=.
go tool pprof cpu.prof

# Memory Profiling
go test -memprofile=mem.prof -bench=.
go tool pprof mem.prof

# Benchmarking
go test -bench=. -benchmem -benchtime=10s

# Race Detection
go test -race ./...
go run -race main.go

# Escape Analysis
go build -gcflags="-m"

# View assembly
go tool compile -S main.go

# Load Testing
hey -n 10000 -c 100 http://localhost:8080/api/users

# Memory statistics at runtime
curl http://localhost:6060/debug/pprof/heap > heap.prof
go tool pprof heap.prof
```

### Resources
- 📖 [Profiling Go Programs](https://go.dev/blog/pprof)
- 📺 [Go Performance Workshop](https://www.youtube.com/watch?v=ZuQcbqYK0BY)
- 📖 [High Performance Go](https://dave.cheney.net/high-performance-go-workshop/gopherchina-2019.html)
- 📖 [Go Performance Tips](https://github.com/dgryski/go-perfbook)

---

# React Interview Questions

## React 1. Managing State in Components

### Detailed Explanation

State management in React refers to how you handle and share data across components. React offers multiple approaches depending on the complexity of your application:

1. **Local State:** `useState`, `useReducer` (component-level)
2. **Lifted State:** Passing state to parent components
3. **Context API:** Global state without prop drilling
4. **External Libraries:** Redux, Zustand, MobX, Recoil

### State Management Approaches

```jsx
import React, { useState, useReducer, useContext, createContext } from 'react';

// ===== 1. Local State with useState =====
function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setCount(count - 1)}>Decrement</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}

// ===== 2. Complex State with useReducer =====
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state.step };
        case 'decrement':
            return { ...state, count: state.count - state.step };
        case 'setStep':
            return { ...state, step: action.payload };
        case 'reset':
            return initialState;
        default:
            throw new Error(`Unknown action: ${action.type}`);
    }
}

function AdvancedCounter() {
    const [state, dispatch] = useReducer(reducer, initialState);
    
    return (
        <div>
            <p>Count: {state.count}</p>
            <p>Step: {state.step}</p>
            <button onClick={() => dispatch({ type: 'increment' })}>
                Increment by {state.step}
            </button>
            <button onClick={() => dispatch({ type: 'decrement' })}>
                Decrement by {state.step}
            </button>
            <input
                type="number"
                value={state.step}
                onChange={(e) => dispatch({ 
                    type: 'setStep', 
                    payload: parseInt(e.target.value) 
                })}
            />
            <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
        </div>
    );
}

// ===== 3. Lifting State Up =====
function ParentComponent() {
    const [sharedValue, setSharedValue] = useState('');
    
    return (
        <div>
            <InputComponent value={sharedValue} onChange={setSharedValue} />
            <DisplayComponent value={sharedValue} />
        </div>
    );
}

function InputComponent({ value, onChange }) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type something..."
        />
    );
}

function DisplayComponent({ value }) {
    return <p>You typed: {value}</p>;
}

// ===== 4. Context API for Global State =====
const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

function ThemedComponent() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    return (
        <div style={{ 
            background: theme === 'light' ? '#fff' : '#333',
            color: theme === 'light' ? '#000' : '#fff'
        }}>
            <p>Current theme: {theme}</p>
            <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <ThemedComponent />
        </ThemeProvider>
    );
}

// ===== 5. Form State Management =====
function RegistrationForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({});
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const validate = () => {
        const newErrors = {};
        
        if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        return newErrors;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newErrors = validate();
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Submit form
        console.log('Form submitted:', formData);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                />
                {errors.username && <span>{errors.username}</span>}
            </div>
            
            <div>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                />
                {errors.email && <span>{errors.email}</span>}
            </div>
            
            <div>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                />
                {errors.password && <span>{errors.password}</span>}
            </div>
            
            <div>
                <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                />
                {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
            </div>
            
            <button type="submit">Register</button>
        </form>
    );
}

// ===== 6. Async State Management =====
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/users/${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                
                const data = await response.json();
                setUser(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [userId]);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return <div>No user found</div>;
    
    return (
        <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}
```

### Custom Hooks for State Management

```jsx
// Custom hook for form handling
function useForm(initialValues) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };
    
    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
    };
    
    return { values, errors, setErrors, handleChange, resetForm };
}

// Custom hook for API calls
function useAPI(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(url);
            const json = await response.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [url]);
    
    return { data, loading, error, refetch: fetchData };
}

// Custom hook for local storage
function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });
    
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function 
                ? value(storedValue) 
                : value;
            
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    
    return [storedValue, setValue];
}

// Usage
function Settings() {
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    
    return (
        <div>
            <p>Current theme: {theme}</p>
            <button onClick={() => setTheme('dark')}>Dark Mode</button>
            <button onClick={() => setTheme('light')}>Light Mode</button>
        </div>
    );
}
```

### Resources
- 📖 [React State Management](https://react.dev/learn/managing-state)
- 📺 [useState vs useReducer](https://www.youtube.com/watch?v=o-nCM1857AQ)
- 📖 [Context API Guide](https://react.dev/learn/passing-data-deeply-with-context)

---

## React 2. How useState Works

### Detailed Explanation

`useState` is a React Hook that lets you add state to function components. React keeps track of the state value between renders and provides a function to update it.

**How it works internally:**
1. React maintains a list of state hooks for each component
2. State is stored in the component's fiber node
3. When you call the setter function, React schedules a re-render
4. On re-render, React returns the updated state value
5. React uses Object.is() comparison to check if state changed

### Complete useState Guide

```jsx
import React, { useState, useEffect } from 'react';

// ===== 1. Basic Usage =====
function BasicExample() {
    // Syntax: const [state, setState] = useState(initialValue);
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}

// ===== 2. Initial State =====
function InitialStateExamples() {
    // Simple value
    const [count, setCount] = useState(0);
    
    // Object
    const [user, setUser] = useState({ name: '', age: 0 });
    
    // Array
    const [items, setItems] = useState([]);
    
    // Lazy initialization (runs only once)
    const [expensive, setExpensive] = useState(() => {
        // This function only runs on initial render
        console.log('Computing expensive initial state');
        return computeExpensiveValue();
    });
    
    return <div>...</div>;
}

// ===== 3. Updating State =====
function UpdateExamples() {
    const [count, setCount] = useState(0);
    
    // Direct value
    const increment = () => {
        setCount(count + 1);
    };
    
    // Functional update (recommended when new state depends on previous)
    const incrementByFunction = () => {
        setCount(prevCount => prevCount + 1);
    };
    
    // Multiple updates in same render
    const incrementMultipleTimes = () => {
        // ❌ BAD: Only increments by 1
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
        
        // ✅ GOOD: Increments by 3
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
    };
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>+1 (Direct)</button>
            <button onClick={incrementByFunction}>+1 (Functional)</button>
            <button onClick={incrementMultipleTimes}>+3</button>
        </div>
    );
}

// ===== 4. Object State Updates =====
function ObjectStateExample() {
    const [user, setUser] = useState({
        name: 'John',
        age: 30,
        email: 'john@example.com'
    });
    
    // ❌ BAD: Direct mutation (doesn't trigger re-render)
    const updateNameBad = () => {
        user.name = 'Jane'; // DON'T DO THIS!
        setUser(user);
    };
    
    // ✅ GOOD: Create new object with spread operator
    const updateName = (newName) => {
        setUser(prevUser => ({
            ...prevUser,
            name: newName
        }));
    };
    
    // Update nested object
    const updateAddress = (newCity) => {
        setUser(prevUser => ({
            ...prevUser,
            address: {
                ...prevUser.address,
                city: newCity
            }
        }));
    };
    
    return (
        <div>
            <p>{user.name}</p>
            <button onClick={() => updateName('Jane')}>Change Name</button>
        </div>
    );
}

// ===== 5. Array State Updates =====
function ArrayStateExample() {
    const [items, setItems] = useState([]);
    
    // Add item
    const addItem = (item) => {
        setItems(prevItems => [...prevItems, item]);
    };
    
    // Remove item by index
    const removeItem = (index) => {
        setItems(prevItems => prevItems.filter((_, i) => i !== index));
    };
    
    // Update item
    const updateItem = (index, newValue) => {
        setItems(prevItems => 
            prevItems.map((item, i) => i === index ? newValue : item)
        );
    };
    
    // Clear all
    const clearItems = () => {
        setItems([]);
    };
    
    // Sort
    const sortItems = () => {
        setItems(prevItems => [...prevItems].sort());
    };
    
    return (
        <div>
            <button onClick={() => addItem(`Item ${items.length + 1}`)}>
                Add Item
            </button>
            <button onClick={sortItems}>Sort</button>
            <button onClick={clearItems}>Clear</button>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>
                        {item}
                        <button onClick={() => removeItem(index)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ===== 6. State Batching =====
function BatchingExample() {
    const [count, setCount] = useState(0);
    const [flag, setFlag] = useState(false);
    
    function handleClick() {
        // React 18: Batches all state updates (only 1 re-render)
        setCount(c => c + 1);
        setFlag(f => !f);
        
        // Before React 18: These would cause 2 re-renders in event handlers
        // but 1 re-render in promises/setTimeout
    }
    
    function handleClickAsync() {
        setTimeout(() => {
            // In React 18: Still batched!
            // Before React 18: Would cause 2 separate re-renders
            setCount(c => c + 1);
            setFlag(f => !f);
        }, 1000);
    }
    
    console.log('Render'); // Count how many times component renders
    
    return (
        <div>
            <p>Count: {count}, Flag: {flag.toString()}</p>
            <button onClick={handleClick}>Update</button>
            <button onClick={handleClickAsync}>Update Async</button>
        </div>
    );
}

// ===== 7. State and Side Effects =====
function SideEffectsExample() {
    const [count, setCount] = useState(0);
    
    // Run effect when count changes
    useEffect(() => {
        console.log(`Count changed to: ${count}`);
        document.title = `Count: ${count}`;
        
        // Cleanup function (optional)
        return () => {
            console.log('Cleanup');
        };
    }, [count]); // Dependency array
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
    );
}

// ===== 8. Common Pitfalls =====
function CommonPitfalls() {
    const [count, setCount] = useState(0);
    
    // ❌ PITFALL 1: Using stale state in async function
    const incrementAsyncBad = () => {
        setTimeout(() => {
            setCount(count + 1); // Uses stale count value!
        }, 1000);
    };
    
    // ✅ FIX: Use functional update
    const incrementAsyncGood = () => {
        setTimeout(() => {
            setCount(prev => prev + 1); // Always uses latest value
        }, 1000);
    };
    
    // ❌ PITFALL 2: State doesn't update immediately
    const logCountBad = () => {
        setCount(count + 1);
        console.log(count); // Still shows old value!
    };
    
    // ✅ FIX: Use useEffect or log directly
    const logCountGood = () => {
        const newCount = count + 1;
        setCount(newCount);
        console.log(newCount); // Correct value
    };
    
    // ❌ PITFALL 3: Creating new objects/arrays in render
    const [user, setUser] = useState({ name: 'John' });
    
    // This creates a NEW object every render!
    const defaultUser = { name: 'John' }; // ❌ BAD
    
    // ✅ GOOD: Define outside component or use useMemo
    const DEFAULT_USER = { name: 'John' };
    
    return <div>...</div>;
}

// ===== 9. Multiple State vs Single State Object =====
function MultipleStatesExample() {
    // Option 1: Multiple state variables (recommended for independent values)
    const [name, setName] = useState('');
    const [age, setAge] = useState(0);
    const [email, setEmail] = useState('');
    
    // Option 2: Single state object (good for related values)
    const [user, setUser] = useState({
        name: '',
        age: 0,
        email: ''
    });
    
    // Choose based on:
    // - Are values updated together? → Single object
    // - Are values independent? → Multiple states
    // - Does one value depend on another? → Consider useReducer
}

// ===== 10. Type Safety with TypeScript =====
/*
interface User {
    id: number;
    name: string;
    email: string;
}

function TypeScriptExample() {
    // Type inference
    const [count, setCount] = useState(0); // number
    
    // Explicit type
    const [user, setUser] = useState<User | null>(null);
    
    // Array type
    const [items, setItems] = useState<string[]>([]);
    
    // Union type
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    
    return <div>...</div>;
}
*/
```

### How useState Works Under the Hood

```jsx
// Simplified implementation of how useState works internally

let componentState = [];
let currentIndex = 0;

function useState(initialValue) {
    const index = currentIndex;
    
    // Initialize state on first render
    if (componentState[index] === undefined) {
        componentState[index] = typeof initialValue === 'function' 
            ? initialValue() 
            : initialValue;
    }
    
    const setState = (newValue) => {
        // Handle functional updates
        const valueToStore = typeof newValue === 'function'
            ? newValue(componentState[index])
            : newValue;
        
        // Only re-render if value changed
        if (!Object.is(componentState[index], valueToStore)) {
            componentState[index] = valueToStore;
            // Schedule re-render
            scheduleRender();
        }
    };
    
    currentIndex++;
    return [componentState[index], setState];
}

// Reset index before each render
function render() {
    currentIndex = 0;
    // Render component...
}
```

### Best Practices

```jsx
// ✅ DO: Use functional updates when new state depends on old state
setCount(prev => prev + 1);

// ✅ DO: Initialize expensive state lazily
const [state, setState] = useState(() => computeExpensive());

// ✅ DO: Keep state minimal and derived values separate
const [items, setItems] = useState([]);
const itemCount = items.length; // Derived, not in state

// ✅ DO: Group related state
const [user, setUser] = useState({ name: '', email: '' });

// ❌ DON'T: Mutate state directly
state.value = 123; // BAD
setState(state); // BAD

// ❌ DON'T: Use state for values that don't trigger re-renders
// Use useRef instead

// ❌ DON'T: Store props in state (usually)
// Leads to stale data
```

### Resources
- 📖 [useState Hook Reference](https://react.dev/reference/react/useState)
- 📺 [How React Hooks Work](https://www.youtube.com/watch?v=1jWS7cCuUXw)
- 📖 [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)

---

## React 3. Closures in JavaScript/React

### Detailed Explanation

A **closure** is a function that has access to variables from its outer (enclosing) scope, even after the outer function has finished executing. Closures are fundamental to JavaScript and are commonly encountered in React, especially with hooks and event handlers.

**Why Closures Matter in React:**
- Event handlers capture state at the time they're created
- `useEffect` and `useCallback` create closures over dependencies
- Understanding closures prevents bugs with stale state

### Closure Basics

```javascript
// ===== 1. Basic Closure Example =====
function outerFunction() {
    const outerVar = 'I am from outer scope';
    
    function innerFunction() {
        console.log(outerVar); // Can access outerVar
    }
    
    return innerFunction;
}

const myFunction = outerFunction();
myFunction(); // "I am from outer scope"
// Even though outerFunction has finished executing,
// innerFunction still has access to outerVar!

// ===== 2. Closure with Parameters =====
function createCounter(initialCount) {
    let count = initialCount;
    
    return {
        increment: function() {
            count++;
            return count;
        },
        decrement: function() {
            count--;
            return count;
        },
        getCount: function() {
            return count;
        }
    };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.increment()); // 12
console.log(counter.getCount());  // 12

// ===== 3. Multiple Closures =====
function createGreeter(greeting) {
    return function(name) {
        return `${greeting}, ${name}!`;
    };
}

const sayHello = createGreeter('Hello');
const sayHi = createGreeter('Hi');

console.log(sayHello('John')); // "Hello, John!"
console.log(sayHi('Jane'));    // "Hi, Jane!"

// Each function has its own closure with different greeting value

// ===== 4. Common Closure Pitfall: Loop =====
// ❌ BAD: All functions reference same variable
function createButtonsBad() {
    const buttons = [];
    
    for (var i = 0; i < 3; i++) {
        buttons.push(function() {
            console.log(i); // All will log 3!
        });
    }
    
    return buttons;
}

const badButtons = createButtonsBad();
badButtons[0](); // 3 (not 0!)
badButtons[1](); // 3 (not 1!)
badButtons[2](); // 3 (not 2!)

// ✅ GOOD: Use let (block scope) or IIFE
function createButtonsGood() {
    const buttons = [];
    
    // Solution 1: Use let
    for (let i = 0; i < 3; i++) {
        buttons.push(function() {
            console.log(i); // Each has its own i
        });
    }
    
    return buttons;
}

const goodButtons = createButtonsGood();
goodButtons[0](); // 0
goodButtons[1](); // 1
goodButtons[2](); // 2

// Solution 2: IIFE (Immediately Invoked Function Expression)
function createButtonsIIFE() {
    const buttons = [];
    
    for (var i = 0; i < 3; i++) {
        buttons.push((function(index) {
            return function() {
                console.log(index);
            };
        })(i));
    }
    
    return buttons;
}
```

### Closures in React

```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

// ===== 1. Stale Closure Problem in React =====
function StaleClosureExample() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        // This closure captures count value when effect runs
        const interval = setInterval(() => {
            console.log(count); // Always logs 0 (stale closure)!
            setCount(count + 1); // Always sets to 1!
        }, 1000);
        
        return () => clearInterval(interval);
    }, []); // Empty dependency array
    
    return <div>Count: {count}</div>;
}

// ✅ FIX 1: Include count in dependencies
function FixedWithDeps() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(count); // Logs current count
            setCount(count + 1);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [count]); // Re-run effect when count changes
    
    return <div>Count: {count}</div>;
}

// ✅ FIX 2: Use functional update
function FixedWithFunctional() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + 1); // No closure over count!
        }, 1000);
        
        return () => clearInterval(interval);
    }, []); // Can keep empty deps
    
    return <div>Count: {count}</div>;
}

// ===== 2. Event Handler Closures =====
function EventHandlerExample() {
    const [count, setCount] = useState(0);
    
    // ❌ Problem: Creates new function every render
    const handleClickBad = () => {
        setTimeout(() => {
            // This captures the count value at the time of click
            console.log(count);
        }, 3000);
    };
    
    // Click multiple times quickly and see different values logged
    
    // ✅ Solution 1: Use useRef for latest value
    const countRef = useRef(count);
    
    useEffect(() => {
        countRef.current = count;
    }, [count]);
    
    const handleClickRef = () => {
        setTimeout(() => {
            console.log(countRef.current); // Always latest value
        }, 3000);
    };
    
    // ✅ Solution 2: Use useCallback with dependencies
    const handleClickCallback = useCallback(() => {
        setTimeout(() => {
            console.log(count); // Current count at callback creation
        }, 3000);
    }, [count]);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <button onClick={handleClickBad}>Log Count (Bad)</button>
            <button onClick={handleClickRef}>Log Count (Ref)</button>
            <button onClick={handleClickCallback}>Log Count (Callback)</button>
        </div>
    );
}

// ===== 3. Closure in Custom Hooks =====
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        // This closure captures current value
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler); // Cleanup captures handler
        };
    }, [value, delay]);
    
    return debouncedValue;
}

function SearchComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    
    useEffect(() => {
        if (debouncedSearch) {
            // API call with debounced value
            console.log('Searching for:', debouncedSearch);
        }
    }, [debouncedSearch]);
    
    return (
        <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
        />
    );
}

// ===== 4. Closure with useCallback =====
function TodoList() {
    const [todos, setTodos] = useState([]);
    
    // ❌ BAD: Creates new function every render
    const addTodoBad = (text) => {
        setTodos([...todos, { id: Date.now(), text }]);
    };
    
    // ✅ GOOD: Memoized with functional update
    const addTodoGood = useCallback((text) => {
        setTodos(prev => [...prev, { id: Date.now(), text }]);
    }, []); // No dependencies needed!
    
    // ✅ Also good: Include todos in deps (but causes re-creation)
    const addTodoWithDeps = useCallback((text) => {
        setTodos([...todos, { id: Date.now(), text }]);
    }, [todos]);
    
    return (
        <div>
            <TodoForm onAdd={addTodoGood} />
            {/* TodoForm won't re-render unnecessarily */}
        </div>
    );
}

// ===== 5. Closure with Class Components =====
class ClassClosureExample extends React.Component {
    state = { count: 0 };
    
    handleClick = () => {
        // ❌ Problem: Captures state at time of click
        setTimeout(() => {
            this.setState({ count: this.state.count + 1 });
        }, 3000);
        // Click multiple times - only increments by 1!
    };
    
    handleClickFixed = () => {
        // ✅ Solution: Use functional setState
        setTimeout(() => {
            this.setState(prevState => ({ count: prevState.count + 1 }));
        }, 3000);
    };
    
    render() {
        return (
            <div>
                <p>Count: {this.state.count}</p>
                <button onClick={this.handleClick}>Increment (Bad)</button>
                <button onClick={this.handleClickFixed}>Increment (Good)</button>
            </div>
        );
    }
}

// ===== 6. Practical Example: Subscription =====
function useSubscription(topic) {
    const [data, setData] = useState(null);
    
    useEffect(() => {
        // Closure over topic and setData
        const handleData = (newData) => {
            setData(newData);
        };
        
        // Subscribe
        const subscription = subscribe(topic, handleData);
        
        // Cleanup captures subscription
        return () => {
            subscription.unsubscribe();
        };
    }, [topic]);
    
    return data;
}

// ===== 7. Memory Leaks with Closures =====
function MemoryLeakExample() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        // ❌ Problem: Interval never cleaned up
        setInterval(() => {
            console.log(count);
        }, 1000);
        // If component unmounts, interval keeps running!
    }, [count]);
    
    // ✅ Solution: Return cleanup function
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(count);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [count]);
}

// ===== 8. Closure in Reducer =====
function useCounterWithHistory() {
    const [state, setState] = useState({
        count: 0,
        history: []
    });
    
    const increment = useCallback(() => {
        setState(prev => ({
            count: prev.count + 1,
            history: [...prev.history, prev.count]
        }));
    }, []);
    
    const undo = useCallback(() => {
        setState(prev => {
            if (prev.history.length === 0) return prev;
            
            const lastCount = prev.history[prev.history.length - 1];
            return {
                count: lastCount,
                history: prev.history.slice(0, -1)
            };
        });
    }, []);
    
    return { ...state, increment, undo };
}
```

### Visual Representation

```
Closure Example:

function outer() {
    const x = 10;          ← Outer scope
    
    function inner() {     ← Inner function
        console.log(x);    ← Accesses x via closure
    }
    
    return inner;
}

const fn = outer();
fn(); // Logs: 10

Even though outer() finished executing,
inner() still has access to x through closure!

┌─────────────────────────┐
│  Outer Function Scope   │
│  x = 10                 │
│                         │
│  ┌───────────────────┐  │
│  │ Inner Function    │  │
│  │ (has closure)     │  │
│  │ Can access x      │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### Best Practices

```jsx
// ✅ DO: Use functional updates to avoid closures over state
setCount(prev => prev + 1);

// ✅ DO: Use useRef for values that shouldn't trigger re-renders
const latestValue = useRef(value);

// ✅ DO: Include all dependencies in useEffect/useCallback
useEffect(() => {
    // use value
}, [value]);

// ✅ DO: Always cleanup in useEffect
useEffect(() => {
    const subscription = subscribe();
    return () => subscription.unsubscribe();
}, []);

// ❌ DON'T: Ignore ESLint exhaustive-deps warnings
// These warnings help catch stale closure bugs

// ❌ DON'T: Create functions inside render without memoization
// Creates new closures every render
```

### Resources
- 📖 [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- 📺 [JavaScript Closures Explained](https://www.youtube.com/watch?v=3a0I8ICR1Vg)
- 📖 [React Hooks and Closures](https://overreacted.io/a-complete-guide-to-useeffect/)
- 📺 [Stale Closures in React](https://www.youtube.com/watch?v=eTDnfS2_WE4)

---

## React 4. useEffect and Console Logging

### Detailed Explanation

`useEffect` is a React Hook that lets you synchronize a component with external systems (side effects). Understanding when and how many times effects run is crucial for debugging React applications.

**Key Concepts:**
- Effects run **after** render (after DOM updates)
- Dependencies control when effects re-run
- Cleanup functions run before next effect and on unmount
- Multiple console logs can indicate re-render issues

### Complete useEffect Guide

```jsx
import React, { useState, useEffect, useRef } from 'react';

// ===== 1. Basic useEffect Execution =====
function BasicEffect() {
    console.log('1. Component rendering');
    
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        console.log('2. Effect runs after render');
        
        return () => {
            console.log('3. Cleanup runs before next effect or unmount');
        };
    });
    
    console.log('4. This logs before effect');
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
    );
}

/*
Initial render logs:
1. Component rendering
4. This logs before effect
2. Effect runs after render

After button click:
1. Component rendering
4. This logs before effect
3. Cleanup runs before next effect or unmount
2. Effect runs after render
*/

// ===== 2. Dependency Array Behavior =====
function DependencyExample() {
    const [count, setCount] = useState(0);
    const [text, setText] = useState('');
    
    // Runs after EVERY render
    useEffect(() => {
        console.log('Effect 1: No dependency array');
    });
    
    // Runs ONLY on mount
    useEffect(() => {
        console.log('Effect 2: Empty dependency array []');
    }, []);
    
    // Runs when count changes
    useEffect(() => {
        console.log('Effect 3: count changed to', count);
    }, [count]);
    
    // Runs when either count or text changes
    useEffect(() => {
        console.log('Effect 4: count or text changed');
    }, [count, text]);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <input value={text} onChange={(e) => setText(e.target.value)} />
        </div>
    );
}

// ===== 3. Console Logging Patterns =====
function ConsoleLoggingExample() {
    const [count, setCount] = useState(0);
    const renderCount = useRef(0);
    
    // Track renders
    renderCount.current += 1;
    console.log(`Render #${renderCount.current}`);
    
    // Log before render (during render phase)
    console.log('A. Rendering with count:', count);
    
    useEffect(() => {
        // Log after render (during commit phase)
        console.log('B. Effect: Count is now', count);
        
        // Log DOM updates
        console.log('C. Document title:', document.title);
        document.title = `Count: ${count}`;
        
        return () => {
            console.log('D. Cleanup: Count was', count);
        };
    }, [count]);
    
    console.log('E. After useEffect declaration');
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
    );
}

/*
Execution order on initial render:
Render #1
A. Rendering with count: 0
E. After useEffect declaration
B. Effect: Count is now 0
C. Document title: 
D. Cleanup: Count was 0 (on next render or unmount)

After clicking button:
Render #2
A. Rendering with count: 1
E. After useEffect declaration
D. Cleanup: Count was 0
B. Effect: Count is now 1
C. Document title: Count: 0
*/

// ===== 4. Multiple useEffect Hooks =====
function MultipleEffects() {
    const [count, setCount] = useState(0);
    
    console.log('Render start');
    
    useEffect(() => {
        console.log('Effect 1');
        return () => console.log('Cleanup 1');
    });
    
    useEffect(() => {
        console.log('Effect 2');
        return () => console.log('Cleanup 2');
    });
    
    useEffect(() => {
        console.log('Effect 3');
        return () => console.log('Cleanup 3');
    });
    
    console.log('Render end');
    
    return <button onClick={() => setCount(c => c + 1)}>Click</button>;
}

/*
Effects run in order they're declared:
Render start
Render end
Effect 1
Effect 2
Effect 3

On re-render:
Render start
Render end
Cleanup 1
Cleanup 2
Cleanup 3
Effect 1
Effect 2
Effect 3
*/

// ===== 5. Debugging Double Renders (React 18 Strict Mode) =====
function StrictModeExample() {
    const [count, setCount] = useState(0);
    
    console.log('Rendering'); // Logs twice in development!
    
    useEffect(() => {
        console.log('Effect'); // Also logs twice in development!
        
        return () => {
            console.log('Cleanup');
        };
    }, []);
    
    return <div>Count: {count}</div>;
}

/*
In React 18 Strict Mode (development only):
Rendering
Rendering (intentional double render)
Effect
Cleanup (intentional)
Effect

In production: Only one render and one effect
*/

// ===== 6. Async Effects and Console Logs =====
function AsyncEffectExample() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        console.log('1. Effect started');
        
        let cancelled = false;
        
        async function fetchData() {
            console.log('2. Fetching data...');
            
            try {
                const response = await fetch('/api/data');
                const json = await response.json();
                
                console.log('3. Data received');
                
                if (!cancelled) {
                    console.log('4. Setting data');
                    setData(json);
                } else {
                    console.log('4. Request cancelled, not setting data');
                }
            } catch (error) {
                console.log('Error:', error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        
        fetchData();
        
        return () => {
            console.log('5. Cleanup: Cancelling request');
            cancelled = true;
        };
    }, []);
    
    console.log('Rendering, loading:', loading);
    
    if (loading) return <div>Loading...</div>;
    return <div>Data: {JSON.stringify(data)}</div>;
}

// ===== 7. Infinite Loop Detection =====
function InfiniteLoopExample() {
    const [count, setCount] = useState(0);
    
    // ❌ BAD: Infinite loop!
    useEffect(() => {
        console.log('This will run infinitely!');
        setCount(count + 1); // Causes re-render → effect runs again
    }, [count]);
    
    // ✅ FIX: Conditional update
    useEffect(() => {
        console.log('This runs once');
        if (count < 10) {
            setCount(count + 1);
        }
    }, [count]);
    
    return <div>Count: {count}</div>;
}

// ===== 8. Logging Component Lifecycle =====
function LifecycleLogger({ name }) {
    const [count, setCount] = useState(0);
    const renderCount = useRef(0);
    
    renderCount.current += 1;
    
    // Log every render
    console.log(`[${name}] Render #${renderCount.current}, count: ${count}`);
    
    // Mount
    useEffect(() => {
        console.log(`[${name}] Component mounted`);
        
        return () => {
            console.log(`[${name}] Component unmounting`);
        };
    }, []);
    
    // Update
    useEffect(() => {
        if (renderCount.current > 1) {
            console.log(`[${name}] Component updated, count: ${count}`);
        }
    }, [count]);
    
    return (
        <div>
            <p>{name}: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
    );
}

// ===== 9. Debugging with useEffect =====
function DebugComponent() {
    const [state1, setState1] = useState(0);
    const [state2, setState2] = useState(0);
    
    // Log all state changes
    useEffect(() => {
        console.log('State changed:', { state1, state2 });
    }, [state1, state2]);
    
    // Log specific state changes
    useEffect(() => {
        console.log('State1 changed to:', state1);
    }, [state1]);
    
    // Log with timestamp
    useEffect(() => {
        console.log(`[${new Date().toISOString()}] State2:`, state2);
    }, [state2]);
    
    // Log props changes
    useEffect(() => {
        console.log('Component re-rendered');
        console.table({ state1, state2 });
    });
    
    return (
        <div>
            <button onClick={() => setState1(s => s + 1)}>Update State1</button>
            <button onClick={() => setState2(s => s + 1)}>Update State2</button>
        </div>
    );
}

// ===== 10. Custom Hook for Logging =====
function useLogger(value, name = 'value') {
    useEffect(() => {
        console.log(`${name} changed to:`, value);
    }, [value, name]);
    
    useEffect(() => {
        console.log(`${name} mounted with:`, value);
        
        return () => {
            console.log(`${name} unmounting with:`, value);
        };
    }, []);
}

function useWhyDidYouUpdate(name, props) {
    const previousProps = useRef();
    
    useEffect(() => {
        if (previousProps.current) {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changedProps = {};
            
            allKeys.forEach(key => {
                if (previousProps.current[key] !== props[key]) {
                    changedProps[key] = {
                        from: previousProps.current[key],
                        to: props[key]
                    };
                }
            });
            
            if (Object.keys(changedProps).length > 0) {
                console.log('[why-did-you-update]', name, changedProps);
            }
        }
        
        previousProps.current = props;
    });
}

function ComponentWithLogging({ count, text }) {
    useLogger(count, 'count');
    useLogger(text, 'text');
    useWhyDidYouUpdate('ComponentWithLogging', { count, text });
    
    return <div>Count: {count}, Text: {text}</div>;
}
```

### Common Console Patterns

```jsx
// Pattern 1: Track render count
const renderCount = useRef(0);
console.log(`Render #${++renderCount.current}`);

// Pattern 2: Log with component name
console.log('[MyComponent] State updated:', state);

// Pattern 3: Conditional logging
if (process.env.NODE_ENV === 'development') {
    console.log('Debug info:', data);
}

// Pattern 4: Group related logs
console.group('Effect Execution');
console.log('Before:', oldValue);
console.log('After:', newValue);
console.groupEnd();

// Pattern 5: Table format for objects
console.table({ state1, state2, state3 });

// Pattern 6: Time measurement
console.time('Effect duration');
// ... effect code ...
console.timeEnd('Effect duration');

// Pattern 7: Stack trace
console.trace('How did we get here?');
```

### Resources
- 📖 [useEffect Reference](https://react.dev/reference/react/useEffect)
- 📺 [useEffect Complete Guide](https://www.youtube.com/watch?v=0ZJgIjIuY7U)
- 📖 [Overreacted: useEffect Guide](https://overreacted.io/a-complete-guide-to-useeffect/)
- 📖 [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

---

## React 5. setTimeout and setInterval

### Detailed Explanation

`setTimeout` and `setInterval` are JavaScript timing functions commonly used in React for delayed execution and recurring tasks. However, they require special handling in React due to:
- Component lifecycle (mounting/unmounting)
- Closures over state
- Memory leaks if not cleaned up properly

### Complete setTimeout/setInterval Guide

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ===== 1. Basic setTimeout in React =====
function BasicTimeout() {
    const [message, setMessage] = useState('');
    
    const handleClick = () => {
        setMessage('Button clicked!');
        
        setTimeout(() => {
            setMessage('Timeout completed!');
        }, 2000);
    };
    
    return (
        <div>
            <p>{message}</p>
            <button onClick={handleClick}>Click me</button>
        </div>
    );
}

// ===== 2. setTimeout in useEffect =====
function TimeoutInEffect() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        // Set timeout that runs once after component mounts
        const timeoutId = setTimeout(() => {
            console.log('Timeout executed after 3 seconds');
            setCount(1);
        }, 3000);
        
        // Cleanup: Clear timeout if component unmounts
        return () => {
            console.log('Clearing timeout');
            clearTimeout(timeoutId);
        };
    }, []);
    
    return <div>Count: {count}</div>;
}

// ===== 3. setInterval Basics =====
function BasicInterval() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        // Runs every second
        const intervalId = setInterval(() => {
            console.log('Interval tick');
            setCount(c => c + 1); // Functional update!
        }, 1000);
        
        // MUST cleanup to prevent memory leaks
        return () => {
            console.log('Clearing interval');
            clearInterval(intervalId);
        };
    }, []);
    
    return <div>Count: {count}</div>;
}

// ===== 4. Common Pitfall: Stale Closure =====
function StaleClosure() {
    const [count, setCount] = useState(0);
    const [running, setRunning] = useState(false);
    
    useEffect(() => {
        if (!running) return;
        
        // ❌ Problem: count is captured in closure
        const interval = setInterval(() => {
            console.log('Count:', count); // Always logs initial value!
            setCount(count + 1); // Always sets to same value!
        }, 1000);
        
        return () => clearInterval(interval);
    }, [running]); // count not in dependencies
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setRunning(!running)}>
                {running ? 'Stop' : 'Start'}
            </button>
        </div>
    );
}

// ===== 5. Fix: Functional Updates =====
function FixedWithFunctional() {
    const [count, setCount] = useState(0);
    const [running, setRunning] = useState(false);
    
    useEffect(() => {
        if (!running) return;
        
        // ✅ Solution: Use functional update
        const interval = setInterval(() => {
            setCount(prev => prev + 1); // Always uses latest value
        }, 1000);
        
        return () => clearInterval(interval);
    }, [running]);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setRunning(!running)}>
                {running ? 'Stop' : 'Start'}
            </button>
        </div>
    );
}

// ===== 6. Fix: Using useRef =====
function FixedWithRef() {
    const [count, setCount] = useState(0);
    const [running, setRunning] = useState(false);
    const countRef = useRef(count);
    
    // Keep ref in sync with state
    useEffect(() => {
        countRef.current = count;
    }, [count]);
    
    useEffect(() => {
        if (!running) return;
        
        const interval = setInterval(() => {
            console.log('Current count:', countRef.current);
            setCount(countRef.current + 1);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [running]);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setRunning(!running)}>
                {running ? 'Stop' : 'Start'}
            </button>
        </div>
    );
}

// ===== 7. Pausable Timer =====
function PausableTimer() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    
    useEffect(() => {
        if (!isRunning) return;
        
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        
        return () => clearInterval(interval);
    }, [isRunning]);
    
    const reset = () => {
        setSeconds(0);
        setIsRunning(false);
    };
    
    return (
        <div>
            <h1>{seconds}s</h1>
            <button onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}

// ===== 8. Countdown Timer =====
function CountdownTimer({ initialSeconds = 60 }) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    
    useEffect(() => {
        if (!isActive || seconds === 0) return;
        
        const interval = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    setIsActive(false);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [isActive, seconds]);
    
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const secs remaining = secs % 60;
        return `${mins}:${remaining.toString().padStart(2, '0')}`;
    };
    
    return (
        <div>
            <h1>{formatTime(seconds)}</h1>
            <button onClick={() => setIsActive(!isActive)}>
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => {
                setSeconds(initialSeconds);
                setIsActive(false);
            }}>
                Reset
            </button>
        </div>
    );
}

// ===== 9. Delayed Search (Debounce) =====
function DelayedSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    
    useEffect(() => {
        // Don't search on empty string
        if (!searchTerm) {
            setResults([]);
            return;
        }
        
        // Wait 500ms after user stops typing
        const timeoutId = setTimeout(() => {
            console.log('Searching for:', searchTerm);
            // Perform search
            fetch(`/api/search?q=${searchTerm}`)
                .then(res => res.json())
                .then(data => setResults(data));
        }, 500);
        
        // Cancel previous timeout if user keeps typing
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);
    
    return (
        <div>
            <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
            />
            <ul>
                {results.map(result => (
                    <li key={result.id}>{result.name}</li>
                ))}
            </ul>
        </div>
    );
}

// ===== 10. Auto-save with Debounce =====
function AutoSaveForm() {
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [saveStatus, setSaveStatus] = useState('');
    
    useEffect(() => {
        // Auto-save 2 seconds after user stops typing
        const timeoutId = setTimeout(() => {
            setSaveStatus('Saving...');
            
            // Simulate API call
            setTimeout(() => {
                console.log('Saved:', formData);
                setSaveStatus('Saved!');
                
                // Clear status after 2 seconds
                setTimeout(() => setSaveStatus(''), 2000);
            }, 500);
        }, 2000);
        
        return () => clearTimeout(timeoutId);
    }, [formData]);
    
    return (
        <div>
            <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
            />
            <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Content"
            />
            <p>{saveStatus}</p>
        </div>
    );
}

// ===== 11. Polling Data =====
function DataPoller({ interval = 5000 }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/data');
                const json = await response.json();
                setData(json);
                setError(null);
            } catch (err) {
                setError(err.message);
            }
        };
        
        // Fetch immediately
        fetchData();
        
        // Then fetch every interval
        const intervalId = setInterval(fetchData, interval);
        
        return () => clearInterval(intervalId);
    }, [interval]);
    
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>Loading...</div>;
    
    return <div>Data: {JSON.stringify(data)}</div>;
}

// ===== 12. Custom Hooks =====

// useTimeout hook
function useTimeout(callback, delay) {
    const savedCallback = useRef(callback);
    
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    
    useEffect(() => {
        if (delay === null) return;
        
        const timeoutId = setTimeout(() => savedCallback.current(), delay);
        return () => clearTimeout(timeoutId);
    }, [delay]);
}

// useInterval hook
function useInterval(callback, delay) {
    const savedCallback = useRef(callback);
    
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    
    useEffect(() => {
        if (delay === null) return;
        
        const intervalId = setInterval(() => savedCallback.current(), delay);
        return () => clearInterval(intervalId);
    }, [delay]);
}

// Usage
function CustomHookExample() {
    const [count, setCount] = useState(0);
    const [delay, setDelay] = useState(1000);
    const [isRunning, setIsRunning] = useState(true);
    
    useInterval(() => {
        setCount(c => c + 1);
    }, isRunning ? delay : null);
    
    return (
        <div>
            <h1>{count}</h1>
            <button onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? 'Pause' : 'Resume'}
            </button>
            <input
                type="number"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
            />
        </div>
    );
}

// ===== 13. Animated Counter =====
function AnimatedCounter({ target, duration = 1000 }) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        const startTime = Date.now();
        const startValue = count;
        const difference = target - startValue;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuad = progress * (2 - progress);
            const current = Math.floor(startValue + difference * easeOutQuad);
            
            setCount(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }, [target, duration]);
    
    return <h1>{count}</h1>;
}
```

### Best Practices

```jsx
// ✅ DO: Always cleanup timeouts/intervals
useEffect(() => {
    const id = setTimeout(() => {}, 1000);
    return () => clearTimeout(id);
}, []);

// ✅ DO: Use functional updates to avoid stale closures
setInterval(() => {
    setCount(prev => prev + 1);
}, 1000);

// ✅ DO: Use null delay to pause intervals
useInterval(callback, isRunning ? 1000 : null);

// ✅ DO: Store latest callback in ref for custom hooks
const savedCallback = useRef(callback);

// ❌ DON'T: Forget to cleanup
useEffect(() => {
    setInterval(() => {}, 1000); // Memory leak!
}, []);

// ❌ DON'T: Use setTimeout/setInterval in render
function BadComponent() {
    setTimeout(() => setState(x), 1000); // BAD!
    return <div>...</div>;
}

// ❌ DON'T: Create new intervals on every render
function BadComponent() {
    setInterval(() => {
        // Creates new interval every render!
    }, 1000);
    return <div>...</div>;
}
```

### Resources
- 📖 [Making setInterval Declarative](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- 📺 [setTimeout in React](https://www.youtube.com/watch?v=7K5IqFOq6YM)
- 📖 [MDN: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- 📖 [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)

---

## React 6. useRef Significance

### Detailed Explanation

`useRef` is a React Hook that returns a mutable ref object whose `.current` property persists between renders. Unlike state, updating a ref doesn't trigger a re-render.

**Key Use Cases:**
1. **Accessing DOM elements directly**
2. **Storing mutable values that don't trigger re-renders**
3. **Keeping track of previous values**
4. **Storing timeout/interval IDs**
5. **Avoiding stale closures**

### Complete useRef Guide

```jsx
import React, { useState, useEffect, useRef } from 'react';

// ===== 1. Basic DOM Reference =====
function DOMReference() {
    const inputRef = useRef(null);
    
    const focusInput = () => {
        // Access DOM element directly
        inputRef.current.focus();
    };
    
    const getInputValue = () => {
        console.log('Input value:', inputRef.current.value);
    };
    
    return (
        <div>
            <input ref={inputRef} type="text" />
            <button onClick={focusInput}>Focus Input</button>
            <button onClick={getInputValue}>Get Value</button>
        </div>
    );
}

// ===== 2. Storing Previous Values =====
function usePrevious(value) {
    const ref = useRef();
    
    useEffect(() => {
        ref.current = value;
    }, [value]);
    
    return ref.current;
}

function PreviousValueExample() {
    const [count, setCount] = useState(0);
    const previousCount = usePrevious(count);
    
    return (
        <div>
            <p>Current: {count}</p>
            <p>Previous: {previousCount}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
    );
}

// ===== 3. Tracking Render Count =====
function RenderCounter() {
    const [count, setCount] = useState(0);
    const renderCount = useRef(0);
    
    // This doesn't cause re-render
    renderCount.current += 1;
    
    return (
        <div>
            <p>State: {count}</p>
            <p>Renders: {renderCount.current}</p>
            <button onClick={() => setCount(c => c + 1)}>Update State</button>
        </div>
    );
}

// ===== 4. Storing Timer IDs =====
function TimerWithRef() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);
    
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);
    
    return (
        <div>
            <p>Seconds: {seconds}</p>
            <button onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => setSeconds(0)}>Reset</button>
        </div>
    );
}

// ===== 5. Avoiding Stale Closures =====
function StaleClosureSolution() {
    const [count, setCount] = useState(0);
    const countRef = useRef(count);
    
    // Keep ref in sync with state
    useEffect(() => {
        countRef.current = count;
    }, [count]);
    
    const handleAlert = () => {
        setTimeout(() => {
            // Using state: would show stale value
            // alert(`Count (stale): ${count}`);
            
            // Using ref: always shows latest value
            alert(`Count (latest): ${countRef.current}`);
        }, 3000);
    };
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
            <button onClick={handleAlert}>Show Alert in 3s</button>
        </div>
    );
}

// ===== 6. Caching Expensive Calculations =====
function ExpensiveCalculation({ items }) {
    const [filter, setFilter] = useState('');
    const cachedResult = useRef(null);
    const prevItems = useRef(items);
    
    // Only recalculate if items actually changed
    if (items !== prevItems.current) {
        cachedResult.current = performExpensiveCalculation(items);
        prevItems.current = items;
    }
    
    const filteredResults = cachedResult.current.filter(item =>
        item.includes(filter)
    );
    
    return (
        <div>
            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter..."
            />
            <ul>
                {filteredResults.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

// ===== 7. Forwarding Refs =====
const FancyInput = React.forwardRef((props, ref) => (
    <div>
        <label>Fancy Input:</label>
        <input ref={ref} {...props} />
    </div>
));

function ForwardRefExample() {
    const inputRef = useRef(null);
    
    const handleFocus = () => {
        inputRef.current.focus();
    };
    
    return (
        <div>
            <FancyInput ref={inputRef} type="text" />
            <button onClick={handleFocus}>Focus</button>
        </div>
    );
}

// ===== 8. useImperativeHandle =====
const CustomInput = React.forwardRef((props, ref) => {
    const inputRef = useRef(null);
    
    React.useImperativeHandle(ref, () => ({
        // Expose only specific methods
        focus: () => {
            inputRef.current.focus();
        },
        clear: () => {
            inputRef.current.value = '';
        },
        getValue: () => {
            return inputRef.current.value;
        }
    }));
    
    return <input ref={inputRef} {...props} />;
});

function ImperativeHandleExample() {
    const inputRef = useRef(null);
    
    return (
        <div>
            <CustomInput ref={inputRef} />
            <button onClick={() => inputRef.current.focus()}>Focus</button>
            <button onClick={() => inputRef.current.clear()}>Clear</button>
            <button onClick={() => alert(inputRef.current.getValue())}>
                Get Value
            </button>
        </div>
    );
}

// ===== 9. Scroll to Element =====
function ScrollToElement() {
    const sectionRefs = useRef([]);
    
    const scrollToSection = (index) => {
        sectionRefs.current[index]?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    };
    
    return (
        <div>
            <nav style={{ position: 'fixed', top: 0 }}>
                {[0, 1, 2, 3].map(i => (
                    <button key={i} onClick={() => scrollToSection(i)}>
                        Section {i + 1}
                    </button>
                ))}
            </nav>
            
            <div style={{ marginTop: '60px' }}>
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        ref={el => sectionRefs.current[i] = el}
                        style={{ height: '100vh', padding: '20px' }}
                    >
                        <h2>Section {i + 1}</h2>
                        <p>Content...</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ===== 10. Canvas Reference =====
function CanvasDrawing() {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const startDrawing = (e) => {
            isDrawing.current = true;
            const rect = canvas.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        };
        
        const draw = (e) => {
            if (!isDrawing.current) return;
            
            const rect = canvas.getBoundingClientRect();
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        };
        
        const stopDrawing = () => {
            isDrawing.current = false;
        };
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
        };
    }, []);
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    return (
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ border: '1px solid black' }}
            />
            <button onClick={clearCanvas}>Clear</button>
        </div>
    );
}

// ===== 11. Video Player Controls =====
function VideoPlayer({ src }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const togglePlay = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    const skipForward = () => {
        videoRef.current.currentTime += 10;
    };
    
    const skipBackward = () => {
        videoRef.current.currentTime -= 10;
    };
    
    return (
        <div>
            <video ref={videoRef} src={src} width="100%" />
            <div>
                <button onClick={togglePlay}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={skipBackward}>-10s</button>
                <button onClick={skipForward}>+10s</button>
            </div>
        </div>
    );
}

// ===== 12. Measuring Element Size =====
function MeasureElement() {
    const elementRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        const updateDimensions = () => {
            if (elementRef.current) {
                const { width, height } = elementRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };
        
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);
    
    return (
        <div>
            <div
                ref={elementRef}
                style={{ padding: '20px', background: 'lightblue' }}
            >
                <p>This element's dimensions are:</p>
                <p>Width: {dimensions.width}px</p>
                <p>Height: {dimensions.height}px</p>
            </div>
        </div>
    );
}

// ===== 13. Auto-focus on Mount =====
function AutoFocusInput() {
    const inputRef = useRef(null);
    
    useEffect(() => {
        // Focus input when component mounts
        inputRef.current?.focus();
    }, []);
    
    return <input ref={inputRef} placeholder="Auto-focused" />;
}

// ===== 14. Callback Ref Pattern =====
function CallbackRefExample() {
    const [height, setHeight] = useState(0);
    
    // Callback ref: function instead of object
    const measuredRef = useCallback(node => {
        if (node !== null) {
            setHeight(node.getBoundingClientRect().height);
        }
    }, []);
    
    return (
        <div>
            <div ref={measuredRef} style={{ padding: '20px' }}>
                <p>This content will be measured</p>
                <p>Height: {height}px</p>
            </div>
        </div>
    );
}

// ===== 15. useRef vs useState =====
function RefVsState() {
    const [stateCount, setStateCount] = useState(0);
    const refCount = useRef(0);
    
    const incrementState = () => {
        setStateCount(c => c + 1);
        console.log('State updated, component will re-render');
    };
    
    const incrementRef = () => {
        refCount.current += 1;
        console.log('Ref updated, no re-render');
        console.log('Ref count:', refCount.current);
    };
    
    console.log('Component rendered');
    
    return (
        <div>
            <p>State Count: {stateCount}</p>
            <p>Ref Count: {refCount.current}</p>
            <button onClick={incrementState}>Increment State</button>
            <button onClick={incrementRef}>Increment Ref</button>
        </div>
    );
}
```

### useRef vs useState Comparison

```jsx
// useState: For values that should trigger re-renders
const [count, setCount] = useState(0);
// - Changing count → component re-renders
// - UI updates to show new count
// - Used for: UI state, data that affects rendering

// useRef: For values that shouldn't trigger re-renders
const countRef = useRef(0);
// - Changing countRef.current → no re-render
// - Value persists between renders
// - Used for: DOM refs, storing IDs, previous values

// When to use what:
// - Need UI to update? → useState
// - Just need to remember something? → useRef
// - Accessing DOM? → useRef
// - Timer IDs? → useRef
// - Previous prop/state value? → useRef
```

### Common Patterns

```jsx
// Pattern 1: Store latest callback
function useLatestCallback(callback) {
    const callbackRef = useRef(callback);
    
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);
    
    return callbackRef;
}

// Pattern 2: Detect first render
function useIsFirstRender() {
    const isFirst = useRef(true);
    
    useEffect(() => {
        isFirst.current = false;
    }, []);
    
    return isFirst.current;
}

// Pattern 3: Component did mount
function useDidMount(callback) {
    const didMount = useRef(false);
    
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            callback();
        }
    }, []);
}

// Pattern 4: Debounced value with ref
function useDebouncedValue(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef(null);
    
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay]);
    
    return debouncedValue;
}
```

### Best Practices

```jsx
// ✅ DO: Use useRef for DOM access
const inputRef = useRef(null);
<input ref={inputRef} />

// ✅ DO: Use useRef for values that don't affect rendering
const intervalId = useRef(null);

// ✅ DO: Initialize ref properly
const ref = useRef(initialValue);

// ✅ DO: Use callback refs for dynamic elements
const measuredRef = useCallback(node => {
    if (node) {
        // measure node
    }
}, []);

// ❌ DON'T: Use ref for values that should trigger re-renders
const count = useRef(0); // Use useState instead!

// ❌ DON'T: Read/write ref during render
function BadComponent() {
    const ref = useRef(0);
    ref.current += 1; // DON'T do this during render!
    return <div>{ref.current}</div>;
}

// ❌ DON'T: Forget to check for null
inputRef.current.focus(); // May be null!
inputRef.current?.focus(); // Better!
```

### Resources
- 📖 [useRef Reference](https://react.dev/reference/react/useRef)
- 📺 [useRef Hook Explained](https://www.youtube.com/watch?v=t2ypzz6gJm0)
- 📖 [Refs and the DOM](https://react.dev/learn/referencing-values-with-refs)
- 📖 [Forwarding Refs](https://react.dev/reference/react/forwardRef)

---

## React 7. Redux vs Context API

### Detailed Explanation

Both Redux and Context API are used for state management in React, but they serve different purposes and have different trade-offs.

**Context API:**
- Built into React
- Best for simple, infrequent state updates
- Component re-renders when context value changes
- Easy to set up, less boilerplate
- Good for theme, auth, language preferences

**Redux:**
- External library
- Best for complex, frequent state updates
- More predictable state updates
- Powerful DevTools
- Middleware support (logging, async actions)
- Better performance optimization
- Good for large applications with complex state

### When to Use What

```
Use Context API when:
✅ Small to medium applications
✅ Infrequent state updates
✅ Simple state structure
✅ Theme, language, authentication
✅ Want to avoid external dependencies
✅ Learning React

Use Redux when:
✅ Large applications
✅ Frequent state updates
✅ Complex state logic
✅ Need middleware (API calls, logging)
✅ Need time-travel debugging
✅ Multiple developers
✅ Predictable state updates required
✅ Need to persist state
```

### Context API Example

```jsx
import React, { createContext, useContext, useState, useReducer } from 'react';

// ===== 1. Basic Context =====
const ThemeContext = createContext();

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

function ThemedButton() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    return (
        <button
            onClick={toggleTheme}
            style={{
                background: theme === 'light' ? '#fff' : '#333',
                color: theme === 'light' ? '#000' : '#fff'
            }}
        >
            Toggle Theme ({theme})
        </button>
    );
}

// ===== 2. Complex Context with useReducer =====
const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingIndex = state.items.findIndex(
                item => item.id === action.payload.id
            );
            
            if (existingIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingIndex].quantity += 1;
                return { ...state, items: newItems };
            }
            
            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }]
            };
            
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };
            
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };
            
        case 'CLEAR_CART':
            return { items: [] };
            
        default:
            return state;
    }
};

function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
    
    const addItem = (item) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };
    
    const removeItem = (id) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
    };
    
    const updateQuantity = (id, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };
    
    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };
    
    const total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    
    return (
        <CartContext.Provider
            value={{
                items: state.items,
                total,
                addItem,
                removeItem,
                updateQuantity,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// Custom hook
function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}

// Usage
function CartDisplay() {
    const { items, total, removeItem } = useCart();
    
    return (
        <div>
            <h2>Shopping Cart</h2>
            {items.map(item => (
                <div key={item.id}>
                    <span>{item.name} x {item.quantity}</span>
                    <button onClick={() => removeItem(item.id)}>Remove</button>
                </div>
            ))}
            <p>Total: ${total}</p>
        </div>
    );
}

// ===== 3. Multiple Contexts =====
const UserContext = createContext();
const NotificationContext = createContext();

function AppProviders({ children }) {
    return (
        <UserContext.Provider value={/* user state */}>
            <NotificationContext.Provider value={/* notification state */}>
                <ThemeProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </ThemeProvider>
            </NotificationContext.Provider>
        </UserContext.Provider>
    );
}
```

### Redux Example

```jsx
// ===== Redux Setup =====

// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import userReducer from './userSlice';

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        user: userReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(logger),
});

// counterSlice.js (Redux Toolkit)
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 0,
        history: []
    },
    reducers: {
        increment: (state) => {
            state.value += 1;
            state.history.push(state.value);
        },
        decrement: (state) => {
            state.value -= 1;
            state.history.push(state.value);
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
            state.history.push(state.value);
        },
        reset: (state) => {
            state.value = 0;
            state.history = [];
        }
    }
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;

// Component using Redux
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset } from './counterSlice';

function Counter() {
    const count = useSelector((state) => state.counter.value);
    const history = useSelector((state) => state.counter.history);
    const dispatch = useDispatch();
    
    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={() => dispatch(increment())}>+</button>
            <button onClick={() => dispatch(decrement())}>-</button>
            <button onClick={() => dispatch(reset())}>Reset</button>
            
            <h2>History</h2>
            <ul>
                {history.map((val, i) => <li key={i}>{val}</li>)}
            </ul>
        </div>
    );
}

// ===== Async Actions with Redux Thunk =====
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (userId) => {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

// Usage
function UserProfile({ userId }) {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.user);
    
    useEffect(() => {
        dispatch(fetchUser(userId));
    }, [dispatch, userId]);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data</div>;
    
    return <div>{data.name}</div>;
}
```

### Performance Comparison

```jsx
// ===== Context API Performance Issue =====
const AppContext = createContext();

function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    const [cart, setCart] = useState([]);
    
    // ❌ Problem: Any change causes ALL consumers to re-render
    return (
        <AppContext.Provider value={{ user, theme, cart, setUser, setTheme, setCart }}>
            {children}
        </AppContext.Provider>
    );
}

// Even if component only needs theme, it re-renders when user changes!
function ThemedComponent() {
    const { theme } = useContext(AppContext);
    console.log('ThemedComponent rendered'); // Logs on ANY context change!
    return <div>Theme: {theme}</div>;
}

// ===== Solution 1: Split Contexts =====
function BetterProviders({ children }) {
    return (
        <UserProvider>
            <ThemeProvider>
                <CartProvider>
                    {children}
                </CartProvider>
            </ThemeProvider>
        </UserProvider>
    );
}

// ===== Solution 2: Memoization =====
const AppContext = createContext();

function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');
    
    // Memoize value
    const value = useMemo(
        () => ({ user, theme, setUser, setTheme }),
        [user, theme]
    );
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Memoize component
const ThemedComponent = memo(function ThemedComponent() {
    const { theme } = useContext(AppContext);
    return <div>Theme: {theme}</div>;
});

// ===== Redux Performance =====
// Redux uses shallow equality checks and only re-renders
// components whose specific state slice changed

function ThemedComponent() {
    // Only re-renders when theme changes, not when user changes
    const theme = useSelector(state => state.theme);
    return <div>Theme: {theme}</div>;
}
```

### Comparison Table

| Feature | Context API | Redux |
|---------|-------------|-------|
| Learning Curve | Low | Medium-High |
| Boilerplate | Minimal | More |
| Performance | Good for small apps | Better for large apps |
| DevTools | No | Excellent |
| Middleware | No | Yes |
| Time Travel | No | Yes |
| Code Splitting | Harder | Easier |
| TypeScript Support | Good | Excellent |
| Community | Built-in | Large |
| Bundle Size | 0KB (built-in) | ~15KB |

### Hybrid Approach

```jsx
// Use Context API for infrequent updates
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    
    const login = async (credentials) => {
        const user = await authService.login(credentials);
        setUser(user);
    };
    
    const logout = () => {
        authService.logout();
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Use Redux for frequent updates and complex state
// (cart, products, filters, etc.)

function App() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <ThemeProvider>
                    <Router>
                        <Routes />
                    </Router>
                </ThemeProvider>
            </AuthProvider>
        </Provider>
    );
}
```

### Best Practices

```jsx
// ✅ Context API Best Practices
// - Split contexts by concern
// - Memoize context values
// - Create custom hooks for each context
// - Use for infrequent updates
// - Keep context values minimal

// ✅ Redux Best Practices
// - Use Redux Toolkit (recommended)
// - Normalize state shape
// - Use selectors (reselect for memoization)
// - Keep actions simple
// - Use middleware for side effects
// - Don't put everything in Redux
```

### Resources
- 📖 [Context API](https://react.dev/learn/passing-data-deeply-with-context)
- 📖 [Redux Docs](https://redux.js.org/)
- 📖 [Redux Toolkit](https://redux-toolkit.js.org/)
- 📺 [Redux vs Context API](https://www.youtube.com/watch?v=OvM4hIxrqAw)
- 📖 [When to use Redux](https://redux.js.org/faq/general#when-should-i-use-redux)
- 📺 [Redux Toolkit Tutorial](https://www.youtube.com/watch?v=9zySeP5vH9c)

---

# Summary

This comprehensive guide covers essential interview questions for both **Golang** and **React** development. Each section includes:

- ✅ **Detailed explanations** of concepts
- ✅ **Complete code examples** with comments
- ✅ **Best practices** and common pitfalls
- ✅ **Real-world use cases**
- ✅ **Video tutorials** and documentation links

## Quick Review Checklist

### Golang
- [ ] Understand `new()` vs `make()`
- [ ] Master channels and goroutines
- [ ] Know common concurrency patterns
- [ ] Handle errors properly (not panic)
- [ ] Build REST APIs with proper error handling
- [ ] Implement authentication and authorization
- [ ] Use structs effectively
- [ ] Secure API endpoints
- [ ] Profile and optimize performance

### React
- [ ] Manage component state effectively
- [ ] Understand how `useState` works
- [ ] Master closures to avoid stale state bugs
- [ ] Use `useEffect` correctly with dependencies
- [ ] Handle `setTimeout`/`setInterval` properly
- [ ] Know when to use `useRef`
- [ ] Choose between Redux and Context API

## Final Tips

1. **Practice coding** - Don't just read, implement these examples
2. **Build projects** - Apply these concepts in real applications
3. **Debug actively** - Use console.log, profilers, and DevTools
4. **Read documentation** - Official docs are your best friend
5. **Stay updated** - Both Go and React evolve constantly

Good luck with your interview! 🚀

