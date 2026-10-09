// Module 37 (Data Science Ecosystem), part A: NumPy, Pandas, Matplotlib.
import { dd, r, type DeepDive } from './deepDive';

export const m37a: Record<string, DeepDive> = {
    'NumPy Arrays': dd(
        [`A <b>NumPy ndarray</b> is a fixed-type, N-dimensional block of contiguous memory. Every element has the same <code>dtype</code>, so operations run in compiled C instead of the Python interpreter.`,
            r`import numpy as np

a = np.array([1, 2, 3, 4, 5, 6])      # 1-D array from a list
m = a.reshape(2, 3)                   # same memory, viewed as 2 rows x 3 cols
print(m)
print(m.shape, m.dtype, m.ndim)       # metadata every array carries

# OUTPUT:
# [[1 2 3]
#  [4 5 6]]
# (2, 3) int64 1`],
        [`Python lists store pointers to full objects, so numeric work is slow and memory hungry. Scientific code needs a compact numeric container that supports math on whole datasets at once.`,
            r`import numpy as np, sys

lst = list(range(1000))
arr = np.arange(1000)
print(sys.getsizeof(lst) + sum(sys.getsizeof(x) for x in lst))  # list + int objects
print(arr.nbytes)                                               # 1000 * 8 bytes

# OUTPUT (example, CPython 64-bit):
# 36856
# 8000`],
        [`Image pixels, sensor streams, financial time series, and every ML framework's tensors are ndarrays or are interchangeable with them (PyTorch, pandas, OpenCV, scikit-learn).`,
            r`import numpy as np

# A tiny 2x2 "grayscale image" - brighten and clip to the 0..255 range
img = np.array([[100, 200],
                [250,  30]], dtype=np.uint8)
bright = np.clip(img.astype(int) + 60, 0, 255).astype(np.uint8)
print(bright)

# OUTPUT:
# [[160 255]
#  [255  90]]`],
        [`<b>Advantages:</b> 10-100x faster than loops, low memory, slicing creates cheap views, rich creation helpers (zeros, linspace, random), and a universal interchange format.`,
            r`import numpy as np

a = np.arange(10)
view = a[2:5]          # slicing returns a VIEW - no copy, O(1)
view[0] = 99           # writing through the view changes the original
print(a)
print(np.linspace(0, 1, 5))   # 5 evenly spaced points, endpoints included

# OUTPUT:
# [ 0  1 99  3  4  5  6  7  8  9]
# [0.   0.25 0.5  0.75 1.  ]`],
        [`<b>Disadvantages:</b> one dtype per array (mixed data gets coerced), fixed size (append copies), and views can cause surprising aliasing bugs.`,
            r`import numpy as np

mixed = np.array([1, "two", 3.0])     # everything is coerced to one type
print(mixed, mixed.dtype)

a = np.array([1, 2, 3])
b = np.append(a, 4)                   # arrays cannot grow: this builds a NEW array
print(a, b)

# OUTPUT:
# ['1' 'two' '3.0'] <U32
# [1 2 3] [1 2 3 4]`],
        [`<b>Limitations:</b> the whole array must fit in RAM, integers silently overflow (no automatic big ints), and no built-in missing-value for integer dtypes.`,
            r`import numpy as np

x = np.array([250], dtype=np.uint8)
print(x + 10)                     # wraps around at 256 - no error raised
print(np.array([1, 2]).dtype)     # an int array cannot hold NaN
# np.array([1, np.nan]) forces float64 as the only way to hold a missing value

# OUTPUT:
# [4]
# int64`],
        `
   Python list                         NumPy ndarray
   +----+   +--------+                +--------------------------------+
   | ptr|-->| int obj|                | 1 | 2 | 3 | 4 | 5 | 6 |  (C)   |
   | ptr|-->| int obj|                +--------------------------------+
   | ptr|-->| int obj|                  one contiguous buffer, one dtype
   +----+   +--------+                  shape=(2,3)  strides=(24,8)
   scattered objects                   -> reshape = new view, same bytes
`,
        `Use ndarrays as the numeric core and keep data in one dtype and contiguous layout so SIMD and BLAS can help. For data larger than RAM use memory-mapped files (np.memmap), Dask or Arrow; for heterogeneous, labeled tables prefer pandas or Polars. Be explicit about dtype at API boundaries to avoid silent overflow and coercion.`
    ),

    'Vectorization & Broadcasting': dd(
        [`<b>Vectorization</b> means applying an operation to a whole array without a Python loop. <b>Broadcasting</b> is the rule that lets arrays of different shapes combine by virtually stretching size-1 (or missing) dimensions.`,
            r`import numpy as np

a = np.array([1, 2, 3])
print(a * 10)            # scalar broadcast to every element
print(a + np.array([10, 20, 30]))   # element-wise on equal shapes

# OUTPUT:
# [10 20 30]
# [11 22 33]`],
        [`Python loops execute one bytecode per element. Vectorized code moves the loop into C, which is dramatically faster and also shorter and clearer.`,
            r`import numpy as np, timeit

a = np.arange(100_000)
loop = timeit.timeit(lambda: [x * 2 for x in a], number=5)
vec  = timeit.timeit(lambda: a * 2, number=5)
print("vectorized is faster:", vec < loop)

# OUTPUT (varies by machine; typically 50-200x):
# vectorized is faster: True`],
        [`Normalising features before ML, applying a price discount to a million rows, or computing distances between points all use broadcasting instead of loops.`,
            r`import numpy as np

X = np.array([[1., 200.],
              [2., 400.],
              [3., 600.]])
# Standardize each column: (3,2) - (2,) broadcasts across rows
Z = (X - X.mean(axis=0)) / X.std(axis=0)
print(Z.round(2))

# OUTPUT:
# [[-1.22 -1.22]
#  [ 0.    0.  ]
#  [ 1.22  1.22]]`],
        [`<b>Advantages:</b> speed, no explicit loops, outer-product-style computations without building giant tiled arrays, and code that reads like the math.`,
            r`import numpy as np

col = np.array([[1], [2], [3]])      # shape (3,1)
row = np.array([10, 20, 30])         # shape (3,)  -> treated as (1,3)
print(col * row)                     # (3,1)*(1,3) -> (3,3) multiplication table

# OUTPUT:
# [[10 20 30]
#  [20 40 60]
#  [30 60 90]]`],
        [`<b>Disadvantages:</b> intermediate arrays use extra memory, and silent broadcasting can hide shape bugs by producing a valid but wrong result.`,
            r`import numpy as np

a = np.array([1, 2, 3])          # shape (3,)
b = np.array([[1], [2], [3]])    # shape (3,1) - mistakenly a column
print((a + b).shape)             # you wanted (3,) but silently got (3,3)

# OUTPUT:
# (3, 3)`],
        [`<b>Limitations:</b> dimensions must be equal or 1 (aligned from the right); otherwise NumPy raises an error. Complex branching logic does not vectorize well.`,
            r`import numpy as np

try:
    np.ones((3, 2)) + np.ones(3)     # trailing dims 2 vs 3 are incompatible
except ValueError as e:
    print(e)

# OUTPUT:
# operands could not be broadcast together with shapes (3,2) (3,) `],
        `
   shapes aligned from the RIGHT, size-1 dims are stretched:

        X      (3, 2)          col  (3, 1)        row  (   3)
      - mean   (   2)   ok     * row(   3)  -->   (3, 3)
      ----------------
      result   (3, 2)

   (3,2) + (3,)  -> 2 vs 3  -> ValueError
`,
        `Prefer vectorized expressions for bulk numeric work, but watch memory: chained operations allocate temporaries (use out=, in-place ops, or numexpr/Numba for fused kernels). Assert shapes at function boundaries to catch accidental broadcasting. When logic is branch-heavy, use np.where or consider Numba rather than contorting the algorithm.`
    ),

    'Linear Algebra with NumPy': dd(
        [`<code>numpy.linalg</code> and the <code>@</code> operator give matrix multiplication, inverses, determinants, solving linear systems, eigenvalues and SVD, backed by optimized BLAS/LAPACK libraries.`,
            r`import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[0, 1], [1, 0]])
print(A @ B)         # matrix product (NOT element-wise)
print(A * B)         # element-wise product - a different thing
print(A.T)           # transpose

# OUTPUT:
# [[2 1]
#  [4 3]]
# [[0 2]
#  [3 0]]
# [[1 3]
#  [2 4]]`],
        [`Machine learning, graphics, physics simulation and statistics are all linear algebra. You need a fast, numerically stable implementation rather than hand-written loops.`,
            r`import numpy as np

# Solve  2x + y = 5,  x + 3y = 10  - use solve(), do not invert
A = np.array([[2., 1.], [1., 3.]])
b = np.array([5., 10.])
x = np.linalg.solve(A, b)
print(x)                      # x=1, y=3
print(np.allclose(A @ x, b))  # verify the solution

# OUTPUT:
# [1. 3.]
# True`],
        [`Linear regression via least squares, PCA via SVD, PageRank via eigenvectors, 3-D rotations in games and robotics.`,
            r`import numpy as np

# Fit y = w*x + c by least squares on perfectly linear data
x = np.array([0., 1., 2., 3.])
y = 2 * x + 1
X = np.column_stack([x, np.ones_like(x)])          # design matrix [x, 1]
w, c = np.linalg.lstsq(X, y, rcond=None)[0]
print(round(w, 3), round(c, 3))

# OUTPUT:
# 2.0 1.0`],
        [`<b>Advantages:</b> multithreaded BLAS speed, one consistent API, numerically stable routines (solve, lstsq, svd), and easy batching over stacked matrices.`,
            r`import numpy as np

A = np.array([[4., 0.], [0., 9.]])
vals, vecs = np.linalg.eig(A)       # eigen-decomposition
print(vals)
print(np.linalg.det(A))             # 4*9
print(np.linalg.norm(np.array([3., 4.])))   # Euclidean length

# OUTPUT:
# [4. 9.]
# 36.0
# 5.0`],
        [`<b>Disadvantages:</b> floating-point error accumulates, singular or ill-conditioned matrices give unreliable results, and inv() is slower and less accurate than solve().`,
            r`import numpy as np

S = np.array([[1., 2.], [2., 4.]])   # rows are multiples: singular
try:
    np.linalg.inv(S)
except np.linalg.LinAlgError as e:
    print("LinAlgError:", e)
print(0.1 + 0.2 == 0.3, np.isclose(0.1 + 0.2, 0.3))

# OUTPUT:
# LinAlgError: Singular matrix
# False True`],
        [`<b>Limitations:</b> dense matrices only (use scipy.sparse for sparse data), everything must fit in memory, and no GPU support (use CuPy, JAX or PyTorch for that).`,
            r`import numpy as np

n = 100_000
# A dense n x n float64 matrix would need n*n*8 bytes:
print(n * n * 8 / 1e9, "GB")      # far beyond typical RAM - use scipy.sparse

# OUTPUT:
# 80.0 GB`],
        `
   Ax = b                 numpy.linalg
   +---+   +-+   +-+       solve(A,b)   -> LAPACK gesv (LU)
   | A | x |x| = |b|       lstsq        -> SVD least squares
   +---+   +-+   +-+       eig / svd    -> decompositions
      \\                     |
       '--> @ (matmul) --> BLAS (OpenBLAS / MKL, multithreaded)
`,
        `Never compute inv(A) @ b; call solve, or factorize once and reuse (scipy.linalg.lu_factor). Check conditioning (np.linalg.cond) before trusting results, and move to sparse or GPU backends when dimensions grow. For ML training use autodiff frameworks rather than hand-coded gradients.`
    ),

    'Pandas Series & DataFrames': dd(
        [`A <b>Series</b> is a labeled 1-D array; a <b>DataFrame</b> is a table of Series sharing one row index. Columns can have different dtypes.`,
            r`import pandas as pd

df = pd.DataFrame({
    "name":  ["Asha", "Ben", "Chen"],
    "score": [88, 92, 75],
})
print(df)
print(df["score"].mean())    # a column is a Series

# OUTPUT:
#    name  score
# 0  Asha     88
# 1   Ben     92
# 2  Chen     75
# 85.0`],
        [`Real data is tabular, labeled and messy. Raw NumPy gives no column names, no mixed types and no alignment, so every analysis would need bookkeeping code.`,
            r`import pandas as pd

a = pd.Series([1, 2, 3], index=["x", "y", "z"])
b = pd.Series([10, 20, 30], index=["y", "z", "w"])
print(a + b)         # arithmetic ALIGNS on labels; missing -> NaN

# OUTPUT:
# w     NaN
# x     NaN
# y    12.0
# z    23.0
# dtype: float64`],
        [`Loading CSV/SQL/Excel/JSON, cleaning it, computing KPIs, then feeding it to charts or models is the day job of analysts and data engineers.`,
            r`import pandas as pd, io

csv = io.StringIO("city,sales\nPune,100\nDelhi,150\n")   # stands in for a file
df = pd.read_csv(csv)
df["sales_k"] = df["sales"] / 1000                       # new derived column
print(df)
print(df.dtypes.to_dict())

# OUTPUT:
#     city  sales  sales_k
# 0   Pune    100    0.100
# 1  Delhi    150    0.150
# {'city': dtype('O'), 'sales': dtype('int64'), 'sales_k': dtype('float64')}`],
        [`<b>Advantages:</b> expressive selection (loc/iloc), label alignment, rich I/O, built-in stats, and tight integration with NumPy, Matplotlib and scikit-learn.`,
            r`import pandas as pd

df = pd.DataFrame({"a": [1, 2, 3], "b": [4, 5, 6]}, index=["r1", "r2", "r3"])
print(df.loc["r2", "b"])        # label-based
print(df.iloc[0, 1])            # position-based
print(df.describe().loc[["mean", "max"]])

# OUTPUT:
# 5
# 4
#         a    b
# mean  2.0  5.0
# max   3.0  6.0`],
        [`<b>Disadvantages:</b> high memory use (often 5-10x file size), ambiguous view-vs-copy semantics, and slow row-wise Python loops.`,
            r`import pandas as pd

df = pd.DataFrame({"x": range(3)})
# Row loops are the slow way - prefer vectorized column math
slow = [row["x"] * 2 for _, row in df.iterrows()]
fast = df["x"] * 2
print(slow, fast.tolist())
print(df.memory_usage(deep=True).sum() > 0)

# OUTPUT:
# [0, 2, 4] [0, 2, 4]
# True`],
        [`<b>Limitations:</b> single-machine and in-memory, mostly single-threaded, and object-dtype strings are costly. Very large data needs Polars, Dask, Spark or a database.`,
            r`import pandas as pd

s = pd.Series(["a", "b", None, "a"] * 1000)
print(s.dtype, s.memory_usage(deep=True) > 100_000)    # object dtype is heavy
print(s.astype("category").memory_usage(deep=True) < s.memory_usage(deep=True))

# OUTPUT:
# object True
# True`],
        `
   DataFrame
          columns -->   name     score    <- each column is a Series
   index  +-----------+--------+--------+
     0    |  Asha     |   88   |   (dtypes may differ per column)
     1    |  Ben      |   92   |
     2    |  Chen     |   75   |
          +-----------+--------+
   Index labels drive alignment, joins and loc[] selection
`,
        `Pandas is ideal for interactive analysis of data that fits in memory. Use categorical and nullable dtypes, avoid iterrows, and consider Parquet plus Polars/DuckDB for faster pipelines. Enable copy-on-write (pandas 2.x) to remove chained-assignment ambiguity, and do not use a DataFrame as a production data structure inside tight services.`
    ),

    'Filtering & GroupBy': dd(
        [`<b>Filtering</b> selects rows with a boolean mask. <b>GroupBy</b> follows split-apply-combine: split rows by key, aggregate each group, combine the results.`,
            r`import pandas as pd

df = pd.DataFrame({"dept": ["IT", "HR", "IT", "HR"], "pay": [50, 40, 70, 45]})
print(df[df["pay"] > 44])                 # boolean mask filter
print(df.groupby("dept")["pay"].mean())   # average pay per department

# OUTPUT:
#   dept  pay
# 0   IT   50
# 2   IT   70
# 3   HR   45
# dept
# HR    42.5
# IT    60.0
# Name: pay, dtype: float64`],
        [`Questions are rarely about all rows: "which orders failed?", "revenue per region?". Without filter and group tools you would write nested loops and dictionaries.`,
            r`# The same task in plain Python vs pandas
rows = [("IT", 50), ("HR", 40), ("IT", 70)]
tot = {}
for d, p in rows:
    tot[d] = tot.get(d, 0) + p
print(tot)

import pandas as pd
print(pd.DataFrame(rows, columns=["d", "p"]).groupby("d")["p"].sum().to_dict())

# OUTPUT:
# {'IT': 120, 'HR': 40}
# {'HR': 40, 'IT': 120}`],
        [`Sales per month, error counts per service, average session length per user cohort, top-N customers per region.`,
            r`import pandas as pd

df = pd.DataFrame({"region": ["N", "N", "S", "S", "S"],
                   "amount": [10, 30, 5, 25, 15]})
# multiple aggregations at once with named outputs
out = df.groupby("region").agg(total=("amount", "sum"),
                               orders=("amount", "count"))
print(out)

# OUTPUT:
#         total  orders
# region
# N          40       2
# S          45       3`],
        [`<b>Advantages:</b> concise, readable, optimized in C/Cython, supports multiple keys, named aggregations, transforms and custom functions.`,
            r`import pandas as pd

df = pd.DataFrame({"g": ["a", "a", "b"], "v": [1, 3, 10]})
df["share"] = df["v"] / df.groupby("g")["v"].transform("sum")   # keeps row count
print(df.query("g == 'a' and v > 1"))
print(df)

# OUTPUT:
#    g  v
# 1  a  3
#    g   v  share
# 0  a   1   0.25
# 1  a   3   0.75
# 2  b  10   1.00`],
        [`<b>Disadvantages:</b> custom Python functions inside apply are slow; chained boolean conditions need parentheses and &amp; / | (not and/or); groupby drops NaN keys by default.`,
            r`import pandas as pd, numpy as np

df = pd.DataFrame({"k": ["a", np.nan, "a"], "v": [1, 2, 3]})
print(df.groupby("k")["v"].sum().to_dict())              # NaN group silently dropped
print(df.groupby("k", dropna=False)["v"].sum().to_dict())

# OUTPUT:
# {'a': 4}
# {'a': 4, nan: 2}`],
        [`<b>Limitations:</b> the groups are computed in memory on one machine, and ordered or window-style logic (rank within group, rolling) needs specific methods rather than plain aggregation.`,
            r`import pandas as pd

df = pd.DataFrame({"g": ["a", "a", "b", "b"], "v": [5, 9, 7, 2]})
# top-1 per group needs sort + head (or idxmax), not a plain aggregation
top = df.sort_values("v", ascending=False).groupby("g").head(1).sort_index()
print(top)

# OUTPUT:
#    g  v
# 1  a  9
# 2  b  7`],
        `
   df  --split by key-->  group a ---> agg ---+
        (groupby)         group b ---> agg ---+--> combine --> result
                          group c ---> agg ---+

   mask = df.pay > 44   -->  [F, T, T, ...]   -->  df[mask] keeps True rows
`,
        `GroupBy is the workhorse for reporting, but heavy aggregation belongs where the data lives (SQL, DuckDB, warehouse) to avoid pulling raw rows into Python. Prefer built-in aggregations and transform over apply with lambdas; use categorical keys for speed and observed=True to avoid empty groups.`
    ),

    'Merge & Pivot': dd(
        [`<code>merge</code> joins two DataFrames on key columns like a SQL join. <code>pivot</code>/<code>pivot_table</code> reshapes long data into a wide grid (and <code>melt</code> reverses it).`,
            r`import pandas as pd

users  = pd.DataFrame({"id": [1, 2, 3], "name": ["Asha", "Ben", "Chen"]})
orders = pd.DataFrame({"id": [1, 1, 3], "amt": [10, 20, 5]})
print(users.merge(orders, on="id", how="left"))    # keep every user

# OUTPUT:
#    id  name   amt
# 0   1  Asha  10.0
# 1   1  Asha  20.0
# 2   2   Ben   NaN
# 3   3  Chen   5.0`],
        [`Data lives in many tables (normalization) and reports need a different shape than storage. You must combine and reshape without manual lookups.`,
            r`import pandas as pd

long = pd.DataFrame({"month": ["Jan", "Jan", "Feb", "Feb"],
                     "prod":  ["A", "B", "A", "B"],
                     "qty":   [5, 7, 6, 8]})
wide = long.pivot(index="month", columns="prod", values="qty")
print(wide)

# OUTPUT:
# prod   A  B
# month
# Feb    6  8
# Jan    5  7`],
        [`Enriching events with customer data, building monthly-by-product dashboards, preparing wide feature matrices for ML.`,
            r`import pandas as pd

sales = pd.DataFrame({"reg": ["N", "N", "S"], "q": ["Q1", "Q1", "Q1"], "amt": [10, 5, 7]})
pt = pd.pivot_table(sales, index="reg", columns="q", values="amt", aggfunc="sum")
print(pt)

# OUTPUT:
# q    Q1
# reg
# N    15
# S     7`],
        [`<b>Advantages:</b> all join types (inner/left/right/outer), validation, indicator column, flexible aggregation in pivot_table, melt to go back to long form.`,
            r`import pandas as pd

a = pd.DataFrame({"k": [1, 2], "x": ["a", "b"]})
b = pd.DataFrame({"k": [2, 3], "y": ["B", "C"]})
print(a.merge(b, on="k", how="outer", indicator=True))

# OUTPUT:
#    k    x    y      _merge
# 0  1    a  NaN   left_only
# 1  2    b    B        both
# 2  3  NaN    C  right_only`],
        [`<b>Disadvantages:</b> duplicate keys multiply rows (many-to-many explosion), and plain pivot fails on duplicate index/column pairs.`,
            r`import pandas as pd

a = pd.DataFrame({"k": [1, 1], "x": [1, 2]})
b = pd.DataFrame({"k": [1, 1], "y": [3, 4]})
print(len(a.merge(b, on="k")))            # 2 x 2 = 4 rows, not 2
try:
    a.merge(b, on="k", validate="one_to_one")
except Exception as e:
    print(type(e).__name__)

# OUTPUT:
# 4
# MergeError`],
        [`<b>Limitations:</b> merges build hash tables in memory, key dtype mismatches (int vs str) silently match nothing, and pivot cannot aggregate.`,
            r`import pandas as pd

a = pd.DataFrame({"k": [1, 2]})
b = pd.DataFrame({"k": ["1", "2"], "v": [9, 8]})
try:
    a.merge(b, on="k")
except ValueError as e:
    print("ValueError:", str(e)[:36])      # modern pandas refuses int-vs-str keys

# OUTPUT:
# ValueError: You are trying to merge on int64 and`],
        `
   users            orders                 merge(on="id", how="left")
   id name          id amt                 id name  amt
   1  Asha   <--+-- 1  10           -->    1  Asha  10
   2  Ben       +-- 1  20                  1  Asha  20
   3  Chen      '-- 3   5                  2  Ben   NaN
                                           3  Chen   5

   long (month,prod,qty) --pivot--> wide grid  --melt--> long again
`,
        `Joins are where silent data bugs breed: always pass validate=, check row counts before and after, and normalize key dtypes and whitespace. For large joins push the work to SQL/DuckDB/Polars, and keep a tidy long table as the source of truth, pivoting only for presentation.`
    ),

    'Handling Missing Data': dd(
        [`Pandas marks missing values as <code>NaN</code> (floats), <code>None</code> or <code>pd.NA</code> (nullable dtypes). You detect them with <code>isna()</code> and treat them with <code>dropna()</code> or <code>fillna()</code>.`,
            r`import pandas as pd, numpy as np

s = pd.Series([1.0, np.nan, 3.0, None])
print(s.isna().tolist())        # which entries are missing
print(s.sum(), s.count())       # NaN skipped by default; count excludes NaN

# OUTPUT:
# [False, True, False, True]
# 4.0 2`],
        [`Real data has gaps (sensor offline, optional form fields). Ignoring them gives wrong averages, crashes models, or biases results.`,
            r`import numpy as np

print(np.nan == np.nan)           # NaN is never equal to itself
print(np.mean([1, 2, np.nan]))    # NumPy propagates NaN: the whole mean is NaN

# OUTPUT:
# False
# nan`],
        [`Cleaning customer records, forward-filling time-series ticks, imputing medians before model training.`,
            r`import pandas as pd, numpy as np

df = pd.DataFrame({"age": [25, np.nan, 35], "city": ["Pune", None, "Delhi"]})
df["age"] = df["age"].fillna(df["age"].median())     # numeric: median
df["city"] = df["city"].fillna("Unknown")            # text: sentinel
print(df)

# OUTPUT:
#     age     city
# 0  25.0     Pune
# 1  30.0  Unknown
# 2  35.0    Delhi`],
        [`<b>Advantages:</b> missing-aware aggregations, and flexible strategies: drop, constant, mean/median, forward/backward fill, interpolation.`,
            r`import pandas as pd, numpy as np

t = pd.Series([10.0, np.nan, np.nan, 40.0])
print(t.interpolate().tolist())     # straight line between known points
print(t.ffill().tolist())           # carry the last value forward

# OUTPUT:
# [10.0, 20.0, 30.0, 40.0]
# [10.0, 10.0, 10.0, 40.0]`],
        [`<b>Disadvantages:</b> NaN forces integer columns to float, and every imputation choice injects assumptions that can bias analysis.`,
            r`import pandas as pd

print(pd.Series([1, 2, None]).dtype)                 # int became float64
print(pd.Series([1, 2, None], dtype="Int64").tolist())   # nullable integer fixes it

# OUTPUT:
# float64
# [1, 2, <NA>]`],
        [`<b>Limitations:</b> a function cannot tell why data is missing (random vs systematic), and dropna can discard most of your rows if every row has some gap.`,
            r`import pandas as pd, numpy as np

df = pd.DataFrame({"a": [1, np.nan, 3], "b": [np.nan, 2, 3], "c": [1, 2, np.nan]})
print(len(df.dropna()))             # any-NaN rule leaves only 0 rows here
print(len(df.dropna(thresh=2)))     # keep rows with at least 2 real values

# OUTPUT:
# 0
# 3`],
        `
   raw data --> isna() mask --> decide ----+--> dropna()      (lose rows)
   [1, ?, 3]    [F, T, F]                  +--> fillna(x)     (constant / stat)
                                           +--> ffill/interp  (time series)
                                           '--> model handles NaN (e.g. trees)
`,
        `Treat missingness as information: record an is_missing indicator column before imputing, fit imputers on training data only (to avoid leakage), and document the strategy. Prefer pandas nullable dtypes in new pipelines, and validate completeness at ingestion with schema checks rather than fixing it deep inside analysis code.`
    ),

    'Matplotlib': dd(
        [`<b>Matplotlib</b> is Python's foundational plotting library. The object-oriented API creates a <code>Figure</code> containing one or more <code>Axes</code>, on which you draw lines, bars, scatters and more.`,
            r`import matplotlib
matplotlib.use("Agg")            # headless backend: render to files, no window
import matplotlib.pyplot as plt

fig, ax = plt.subplots()          # one figure, one axes
ax.plot([1, 2, 3], [2, 4, 8], marker="o", label="growth")
ax.set_xlabel("step"); ax.set_ylabel("value"); ax.legend()
fig.savefig("growth.png", dpi=100)
print("saved growth.png")

# OUTPUT:
# saved growth.png`],
        [`Numbers in a table hide patterns. A chart shows trends, outliers and distributions in seconds, and reports and papers need reproducible figures.`,
            r`import numpy as np
data = np.array([3, 4, 4, 5, 5, 5, 6, 6, 20])
print("mean:", data.mean().round(2), "median:", np.median(data))
# The mean looks normal, but only a plot (boxplot/hist) reveals the outlier 20.

# OUTPUT:
# mean: 6.44 median: 5.0`],
        [`Dashboards, scientific papers, monitoring reports and ML training curves; also the base of seaborn and the pandas .plot() method.`,
            r`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

df = pd.DataFrame({"month": ["Jan", "Feb", "Mar"], "sales": [100, 140, 120]})
ax = df.plot.bar(x="month", y="sales", legend=False)   # pandas wraps Matplotlib
ax.set_title("Monthly sales")
ax.figure.savefig("sales.png")
print(type(ax).__name__)

# OUTPUT:
# Axes`],
        [`<b>Advantages:</b> total control over every element, publication-quality vector output (SVG/PDF), huge chart variety, and works in notebooks, scripts and servers.`,
            r`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, (a1, a2) = plt.subplots(1, 2, figsize=(6, 2))   # side-by-side panels
a1.hist([1, 2, 2, 3, 3, 3], bins=3)
a2.scatter([1, 2, 3], [3, 1, 2])
fig.savefig("panels.svg")                            # vector format
print(len(fig.axes), "axes")

# OUTPUT:
# 2 axes`],
        [`<b>Disadvantages:</b> verbose for complex charts, dated default look, two APIs (pyplot state machine vs object-oriented) cause confusion, and no built-in interactivity in static output.`,
            r`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.plot([1, 2, 3])        # pyplot: implicit "current" axes - hidden global state
plt.title("A")
plt.figure()               # silently starts a new figure; later calls go there
plt.title("B")
print(len(plt.get_fignums()), "figures alive")   # easy to leak figures

# OUTPUT:
# 2 figures alive`],
        [`<b>Limitations:</b> slow with millions of points, limited web interactivity (use Plotly/Bokeh), and 3-D support is basic.`,
            r`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

# Plot 1 million points: works but renders slowly - downsample or use datashader
x = np.arange(1_000_000)
fig, ax = plt.subplots()
ax.plot(x[::1000], np.sin(x[::1000] / 1e4))   # decimate to 1000 points
plt.close(fig)                                # free memory
print(len(x[::1000]))

# OUTPUT:
# 1000`],
        `
   Figure  (the canvas)
   +-------------------------------------------+
   |  Axes (a plot)            Axes            |
   |  +-----------------+     +-------------+  |
   |  | line / bar /    |     | scatter     |  |
   |  | hist artists    |     | + ticks     |  |
   |  +-----------------+     +-------------+  |
   +-------------------------------------------+
        |
        v  savefig -> PNG (raster) | SVG / PDF (vector)
`,
        `Use the object-oriented API (fig, ax) in libraries and services so state never leaks, and pick the Agg backend on servers. Matplotlib suits static, publication-grade output; choose Plotly/Altair/Bokeh for interactive dashboards and datashader for very large point clouds. Always close figures in long-running processes.`
    )
};
