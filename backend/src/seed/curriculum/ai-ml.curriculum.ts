import type { CurriculumCourseDef, CurriculumModuleDef } from "./types";

const pythonForAiMl: CurriculumModuleDef = {
  name: "Python for AI/ML",
  description: "A working refresher on the exact slice of Python — core syntax, NumPy, and Pandas — that every AI/ML workflow leans on.",
  estimatedDuration: "1 week",
  lessons: [
    {
      title: "Python Fundamentals Refresher: Functions & Control Flow",
      description: "Reviewing functions, loops, and conditionals through the lens of data-processing code.",
      estimatedMinutes: 18,
      difficulty: "BEGINNER",
      whatIsIt: "Functions are named, reusable blocks of code that take inputs and return outputs; control flow (if/else, for, while) decides which code runs and how many times. Together they let you describe a repeatable recipe instead of writing the same steps over and over.",
      whyItMatters: "Nearly every ML script is a pipeline: load data, clean it, transform it, feed it to a model. Functions let you name each step clearly, and control flow lets you apply the same cleaning logic to thousands of rows without copy-pasting.",
      analogy: "A function is like a recipe card in a kitchen. You write 'chop vegetables' once, and any cook (any part of your program) can follow that card whenever needed, using whatever vegetables (arguments) they hand it, without you re-explaining the chopping technique every time.",
      simpleExample: "Instead of writing the formula to convert Celsius to Fahrenheit five separate times in your code, you write one function `to_fahrenheit(celsius)` and call it wherever you need a conversion.",
      technicalExplanation: "A Python function is defined with `def name(parameters):` and optionally returns a value with `return`. Control flow statements like `if/elif/else` branch execution based on conditions, `for` loops iterate over a sequence (list, range, dataframe rows), and `while` loops repeat until a condition becomes false. Functions can take default arguments, `*args`, and `**kwargs` for flexibility.",
      codeExamples: [
        {
          title: "A reusable cleaning function applied in a loop",
          language: "python",
          code: "def clean_score(raw_score):\n    \"\"\"Clamp a score between 0 and 100, treating missing values as 0.\"\"\"\n    if raw_score is None:\n        return 0\n    return max(0, min(100, raw_score))\n\nraw_scores = [105, None, -10, 87]\ncleaned = [clean_score(s) for s in raw_scores]\nprint(cleaned)  # [100, 0, 0, 87]",
          explanation: "`clean_score` encapsulates one rule (clamp and handle missing values) as a named, testable unit. The list comprehension then applies that same function to every element, which is exactly how real data-cleaning pipelines scale to millions of rows.",
        },
      ],
      realWorldUsage: "Every data-loading script, feature-engineering pipeline, and training loop in ML is built from functions and control flow — from a one-line helper that normalizes text to the training loop that iterates over epochs and batches.",
      commonMistakes: [
        {
          wrong: "Writing one long script with no functions, so the same cleaning logic is copy-pasted in five places.",
          right: "Wrap repeated logic in a function with a clear name, and call that function everywhere it's needed.",
          explanation: "Duplicated logic means a bug fix or a rule change has to be made in every copy — functions centralize the logic so you only fix it once.",
        },
      ],
      practice: {
        instructions: "Write a function `normalize_text(s)` that lowercases a string, strips leading/trailing whitespace, and removes any exclamation marks. Apply it to a list of five messy strings using a loop or list comprehension.",
        hint: "String methods `.lower()`, `.strip()`, and `.replace('!', '')` chain together nicely.",
      },
      quiz: [
        {
          question: "Why prefer a function over copy-pasting the same logic in multiple places?",
          options: [
            "Functions run faster automatically",
            "It centralizes the logic so changes only need to be made once",
            "Python requires functions for any repeated code",
            "It uses less memory always",
          ],
          correctIndex: 1,
          explanation: "The main benefit is maintainability: one definition, called from many places, means one place to fix or improve it.",
        },
        {
          question: "What does a `for` loop over a list do?",
          options: [
            "Runs the code block once for every element in the list",
            "Deletes the list after use",
            "Runs the code block exactly once",
            "Sorts the list automatically",
          ],
          correctIndex: 0,
          explanation: "A `for` loop iterates, executing its body once per element in the sequence it's given.",
        },
      ],
      rememberThis: "A function is a recipe card: write the steps once, hand it whatever ingredients you like, and reuse it forever.",
      keyTakeaways: [
        "Functions package reusable logic under a clear name.",
        "Control flow (if/for/while) decides what runs and how many times.",
        "Data pipelines are built from small, composable functions.",
        "Duplicated logic is a maintenance risk — extract it into a function instead.",
      ],
    },
    {
      title: "Python Data Structures for ML: Lists, Dicts, and Tuples",
      description: "Choosing the right built-in structure to hold and organize data before it reaches a model.",
      estimatedMinutes: 16,
      difficulty: "BEGINNER",
      whatIsIt: "Lists, dictionaries, tuples, and sets are Python's built-in ways of grouping data. A list is an ordered, changeable collection; a dictionary maps keys to values; a tuple is an ordered, unchangeable collection; a set holds unique items with no order.",
      whyItMatters: "Before any data reaches NumPy or a model, it usually passes through these plain Python structures — reading a JSON API response, building a lookup table of labels, or collecting rows before converting them into an array.",
      analogy: "Think of a list as a numbered row of lockers (order matters, and you can swap contents), a dictionary as a labeled filing cabinet (you look things up by name, not position), and a tuple as a sealed, tamper-proof envelope — the contents are fixed once created.",
      simpleExample: "A dataset's column names might live in a list (`['age', 'income', 'label']`), while a single row's label mapping might live in a dictionary (`{'cat': 0, 'dog': 1}`).",
      technicalExplanation: "Lists (`[]`) support indexing, slicing, and mutation in O(1) amortized append time. Dictionaries (`{}`) provide O(1) average-case key lookup, ideal for label encoding or counting. Tuples (`()`) are immutable, often used for fixed-size records like (x, y) coordinates. Sets (`{}` via `set()`) enforce uniqueness and support fast membership tests, useful for deduplicating vocabulary in NLP.",
      codeExamples: [
        {
          title: "Building a label-to-index mapping with a dictionary",
          language: "python",
          code: "labels = ['cat', 'dog', 'cat', 'bird', 'dog']\nunique_labels = sorted(set(labels))\nlabel_to_index = {label: i for i, label in enumerate(unique_labels)}\nprint(label_to_index)  # {'bird': 0, 'cat': 1, 'dog': 2}\n\nencoded = [label_to_index[l] for l in labels]\nprint(encoded)  # [1, 2, 1, 0, 2]",
          explanation: "`set(labels)` deduplicates the raw labels, and the dictionary comprehension assigns each unique label an integer index — this is exactly what label encoding does before feeding categorical data into a model.",
        },
      ],
      realWorldUsage: "Dictionaries power label encoding and JSON API parsing; lists hold ordered feature names or batches of raw records; tuples represent fixed coordinate pairs or (input, label) training examples; sets deduplicate vocabularies in text processing.",
      commonMistakes: [
        {
          wrong: "Using a list to look up values by name, scanning through it with a loop every time.",
          right: "Use a dictionary when you need to look things up by a key — it's dramatically faster and clearer.",
          explanation: "Searching a list for a match is O(n) per lookup; a dictionary lookup is O(1) on average, and the code reads as 'get me the value for this key' instead of a manual search.",
        },
      ],
      practice: {
        instructions: "Given the list `readings = [23.4, 19.1, 23.4, 30.0, 19.1]`, use a set to find how many unique readings exist, then build a dictionary counting how many times each reading appears.",
        hint: "You can count occurrences manually with a loop, or explore `collections.Counter`.",
      },
      quiz: [
        {
          question: "Which structure guarantees unique elements with no defined order?",
          options: ["List", "Tuple", "Set", "String"],
          correctIndex: 2,
          explanation: "A set automatically removes duplicates and doesn't preserve insertion order the way a list does.",
        },
        {
          question: "What is the main advantage of a dictionary over a list for lookups by name?",
          options: [
            "Dictionaries use less memory always",
            "Dictionary lookups by key are much faster than scanning a list",
            "Dictionaries can only store numbers",
            "Lists cannot store strings",
          ],
          correctIndex: 1,
          explanation: "Dictionary key lookups are O(1) on average, versus O(n) for scanning a list to find a match.",
        },
      ],
      rememberThis: "Lists keep order, dictionaries answer 'what goes with this key', tuples lock things in place, and sets refuse duplicates.",
      keyTakeaways: [
        "Lists are ordered and mutable; tuples are ordered and immutable.",
        "Dictionaries give fast key-based lookup, ideal for label encoding.",
        "Sets deduplicate and give fast membership checks.",
        "Choosing the right structure makes data-prep code faster and clearer.",
      ],
    },
    {
      title: "NumPy Refresher: Arrays and Vectorized Operations",
      description: "Working with NumPy arrays, the numeric foundation underneath almost every ML library.",
      estimatedMinutes: 22,
      difficulty: "BEGINNER",
      whatIsIt: "NumPy is a Python library for working with arrays — grid-like collections of numbers — and doing math on them all at once instead of one element at a time. A NumPy array is like a supercharged list built specifically for numerical computation.",
      whyItMatters: "Machine learning is fundamentally about doing math on large tables of numbers. Plain Python loops are far too slow for this at scale; NumPy performs the same operations using highly optimized, compiled code underneath, often 50-100x faster.",
      analogy: "A Python list is like adding a column of numbers by hand, one at a time, with a calculator. A NumPy array is like handing the entire column to a spreadsheet and asking it to sum, multiply, or transform every cell simultaneously — same result, vastly less effort and time.",
      simpleExample: "To double every number in [1, 2, 3, 4], a plain Python loop checks and multiplies each one individually; a NumPy array lets you write `arr * 2` and it doubles all four numbers in one vectorized operation.",
      technicalExplanation: "A NumPy `ndarray` is a fixed-type, multi-dimensional grid of values stored in contiguous memory, which enables vectorized operations — element-wise math applied across the whole array without an explicit Python-level loop. Operations like `+`, `*`, broadcasting (aligning arrays of different shapes), and aggregate functions (`sum`, `mean`, `std`) are implemented in C for speed.",
      codeExamples: [
        {
          title: "Vectorized math vs. a manual loop",
          language: "python",
          code: "import numpy as np\n\nprices = np.array([100, 250, 75, 400])\ndiscounted = prices * 0.9  # vectorized: no explicit loop needed\nprint(discounted)  # [ 90. 225.  67.5 360. ]\nprint('Average discounted price:', discounted.mean())",
          explanation: "`prices * 0.9` multiplies every element by 0.9 in one vectorized call. `.mean()` computes the average across the whole array. Both run as fast, compiled operations instead of a Python `for` loop.",
        },
      ],
      realWorldUsage: "NumPy underlies pandas, scikit-learn, PyTorch, and TensorFlow — every dataset, weight matrix, and gradient in ML is ultimately a NumPy-style array. It's the numeric backbone of the entire Python ML ecosystem.",
      commonMistakes: [
        {
          wrong: "Looping over a NumPy array element by element in pure Python to apply a transformation.",
          right: "Use vectorized operations (`arr * 2`, `np.where(...)`, `arr.mean()`) so NumPy's compiled code does the heavy lifting.",
          explanation: "A Python-level loop over an array throws away NumPy's main advantage — speed — and can be 50-100x slower on large datasets.",
        },
      ],
      practice: {
        instructions: "Create a NumPy array of 10 exam scores. Compute the mean, standard deviation, and the scores after adding 5 bonus points to everyone (capped at 100) — all without writing a Python `for` loop.",
        hint: "`np.clip(arr, 0, 100)` caps values within a range in one call.",
      },
      quiz: [
        {
          question: "What makes NumPy operations faster than equivalent pure Python loops?",
          options: [
            "NumPy skips doing the actual math",
            "Operations are vectorized and run as compiled, optimized code",
            "NumPy arrays are stored on the GPU by default",
            "Python loops are actually faster",
          ],
          correctIndex: 1,
          explanation: "Vectorization lets NumPy apply an operation to an entire array using optimized, compiled routines instead of a slow, interpreted Python loop.",
        },
        {
          question: "What does `prices * 0.9` do when `prices` is a NumPy array?",
          options: [
            "Throws an error",
            "Multiplies only the first element by 0.9",
            "Multiplies every element in the array by 0.9",
            "Converts the array to a string",
          ],
          correctIndex: 2,
          explanation: "This is a vectorized broadcast operation: the scalar 0.9 is applied to every element of the array at once.",
        },
      ],
      rememberThis: "NumPy trades one-at-a-time Python loops for whole-array math — that trade is the reason Python can do serious ML at all.",
      keyTakeaways: [
        "NumPy arrays are fixed-type, contiguous grids of numbers.",
        "Vectorized operations apply math to entire arrays without explicit loops.",
        "NumPy is dramatically faster than pure Python for numerical work.",
        "Nearly every ML library is built on top of NumPy-style arrays.",
      ],
    },
    {
      title: "Pandas Refresher: DataFrames for Real-World Data",
      description: "Loading, inspecting, and cleaning tabular data using pandas before it becomes model input.",
      estimatedMinutes: 22,
      difficulty: "BEGINNER",
      whatIsIt: "Pandas is a Python library built on top of NumPy for working with tabular data — rows and columns, like a spreadsheet or database table — through an object called a DataFrame. It's the standard tool for loading, cleaning, filtering, and exploring datasets in Python.",
      whyItMatters: "Real-world data almost never arrives clean or ready for a model. It comes as messy CSVs with missing values, wrong types, and inconsistent formatting. Pandas gives you the tools to inspect and fix all of that before training even begins.",
      analogy: "A pandas DataFrame is like Excel with superpowers and a memory. You can filter rows, sum columns, and spot missing values the way you would in a spreadsheet, but you can also script it, repeat it exactly on new data, and handle millions of rows without your computer freezing.",
      simpleExample: "Given a CSV of house listings with a 'price' column that has some blank cells, pandas lets you load the file, immediately see how many prices are missing, and fill or drop those rows in one line.",
      technicalExplanation: "A `DataFrame` is a 2D labeled data structure with columns that can hold different types. Common operations include `pd.read_csv()` to load data, `.head()`/`.info()`/`.describe()` to inspect it, boolean indexing (`df[df['price'] > 100000]`) to filter rows, `.isnull().sum()` to find missing values, and `.fillna()`/`.dropna()` to handle them.",
      codeExamples: [
        {
          title: "Loading and cleaning a dataset with pandas",
          language: "python",
          code: "import pandas as pd\n\ndf = pd.read_csv('houses.csv')\nprint(df.info())               # column types and non-null counts\nprint(df.isnull().sum())       # missing values per column\n\ndf['price'] = df['price'].fillna(df['price'].median())\ndf = df.dropna(subset=['bedrooms'])\n\nexpensive = df[df['price'] > 500000]\nprint(f\"{len(expensive)} houses over 500k\")",
          explanation: "`read_csv` loads the file into a DataFrame. `.info()` and `.isnull().sum()` reveal data quality issues. Missing prices are filled with the median (a common, robust default), rows missing bedroom counts are dropped, and boolean indexing filters for expensive houses.",
        },
      ],
      realWorldUsage: "Pandas is the default tool for the data-cleaning and exploration stage of virtually every ML project — loading CSVs/JSON/SQL results, merging datasets, engineering features, and preparing the final table that gets converted into NumPy arrays for model training.",
      commonMistakes: [
        {
          wrong: "Silently dropping every row with any missing value using `df.dropna()` without checking how much data that removes.",
          right: "Check `df.isnull().sum()` first, and decide per-column whether to fill, drop, or investigate the missingness before acting.",
          explanation: "Blindly dropping rows can quietly discard a large fraction of your dataset, introduce bias if missingness isn't random, and hurt model performance without any visible error.",
        },
      ],
      practice: {
        instructions: "Load any small CSV (or create one with `pd.DataFrame({...})`), print `.info()` and `.describe()`, then filter it to only rows where a chosen numeric column is above its own mean.",
        hint: "`df['col'].mean()` gives you the threshold to filter with, e.g. `df[df['col'] > df['col'].mean()]`.",
      },
      quiz: [
        {
          question: "What does `df.isnull().sum()` typically tell you?",
          options: [
            "The total number of rows in the DataFrame",
            "The count of missing values in each column",
            "The sum of all numeric values",
            "Whether the file loaded successfully",
          ],
          correctIndex: 1,
          explanation: "`isnull()` produces a True/False mask for missing values, and `.sum()` per column counts how many are missing in each one.",
        },
        {
          question: "Why is checking missingness before calling `dropna()` important?",
          options: [
            "It isn't important, dropna() is always safe",
            "Dropping rows blindly can remove a large, possibly biased chunk of the dataset",
            "dropna() deletes the entire file",
            "Pandas requires it before loading data",
          ],
          correctIndex: 1,
          explanation: "Understanding how much and which data is missing helps you choose a defensible strategy instead of silently losing information.",
        },
      ],
      rememberThis: "Pandas is where messy real-world data gets interrogated and cleaned up before a model ever sees it.",
      keyTakeaways: [
        "A DataFrame is a labeled, 2D table built on top of NumPy.",
        "`.info()`, `.describe()`, and `.isnull().sum()` are your first inspection steps.",
        "Boolean indexing filters rows based on column conditions.",
        "Handle missing data deliberately — don't drop rows blindly.",
      ],
    },
  ],
};

const mathematicsForMl: CurriculumModuleDef = {
  name: "Mathematics for ML",
  description: "Just enough linear algebra, probability, and calculus intuition to understand what ML algorithms are actually doing.",
  estimatedDuration: "1 week",
  lessons: [
    {
      title: "Linear Algebra Basics: Vectors, Matrices, and the Dot Product",
      description: "Building intuition for the number-grids that represent all ML data, without diving into formal proofs.",
      estimatedMinutes: 22,
      difficulty: "BEGINNER",
      whatIsIt: "A vector is simply an ordered list of numbers (like [height, weight, age] for a person), and a matrix is a grid of numbers arranged in rows and columns (like a whole table of people's measurements). The dot product is a way of combining two vectors into a single number by multiplying matching positions and summing the results.",
      whyItMatters: "Every piece of data an ML model sees — an image, a sentence, a row in a spreadsheet — gets converted into vectors and matrices. Model predictions are computed almost entirely through dot products and matrix operations, so this is the literal language models 'think' in.",
      analogy: "Think of a vector as a shopping list with quantities: [2 apples, 3 bananas, 1 mango]. The dot product is like a cashier multiplying each quantity by its price and adding it all up to get your total bill — one combined number summarizing many individual values weighted by importance.",
      simpleExample: "If a house is represented as the vector [size=1500, bedrooms=3] and a model's learned weights are [price_per_sqft=100, price_per_bedroom=5000], the dot product (1500×100 + 3×5000 = 165,000) is exactly the kind of calculation behind a simple price prediction.",
      technicalExplanation: "A vector in n-dimensional space is an ordered tuple of n numbers. A matrix is an m×n array of numbers, often representing a batch of vectors (rows) each with n features (columns). The dot product of two equal-length vectors a and b is Σ(a_i × b_i), and matrix multiplication generalizes this — computing many dot products at once between rows of one matrix and columns of another. This is exactly how a neural network layer transforms its input.",
      codeExamples: [
        {
          title: "Dot product and matrix multiplication with NumPy",
          language: "python",
          code: "import numpy as np\n\nhouse = np.array([1500, 3])           # [size, bedrooms]\nweights = np.array([100, 5000])       # learned weights\nprice = np.dot(house, weights)\nprint(price)  # 165000\n\n# A batch of 3 houses (matrix) times the same weights\nhouses = np.array([[1500, 3], [2000, 4], [900, 2]])\nprices = houses @ weights\nprint(prices)  # [165000 220000 100000]",
          explanation: "`np.dot` computes the dot product for a single vector pair. The `@` operator performs matrix multiplication, applying the same weighted-sum logic to every row of `houses` simultaneously — this is precisely how a linear model scores many examples at once.",
        },
      ],
      realWorldUsage: "Dot products and matrix multiplication are the core computation inside linear regression, neural network layers, recommendation systems (comparing user/item vectors), and embedding similarity search.",
      commonMistakes: [
        {
          wrong: "Treating vectors and matrices as just 'arrays of numbers' with no regard to their shape when combining them.",
          right: "Always check that dimensions align (e.g., the number of columns in the first matrix matches the number of rows/length in the second) before multiplying.",
          explanation: "Matrix multiplication and dot products are only defined when shapes are compatible; mismatched shapes are one of the most common bugs in ML code (and NumPy will raise a clear shape error).",
        },
      ],
      practice: {
        instructions: "Represent three students as vectors of [hours_studied, practice_tests_taken]. Choose your own 'weights' vector reflecting how much each factor matters, and compute a predicted score for each student using the dot product.",
        hint: "Use `np.array` for each student and `np.dot(student, weights)` for each prediction.",
      },
      quiz: [
        {
          question: "What is a vector, in the simplest sense?",
          options: [
            "A single number",
            "An ordered list of numbers",
            "A type of loop",
            "A picture file",
          ],
          correctIndex: 1,
          explanation: "A vector is just an ordered sequence of numbers, each representing one feature or dimension.",
        },
        {
          question: "What does the dot product of two vectors produce?",
          options: [
            "A new, longer vector",
            "A single number, the sum of element-wise products",
            "A matrix",
            "An error, since vectors can't be combined",
          ],
          correctIndex: 1,
          explanation: "The dot product multiplies corresponding elements and sums them into one scalar value.",
        },
      ],
      rememberThis: "A dot product is a cashier's total: multiply each item by its price, and add it all into one number.",
      keyTakeaways: [
        "Vectors are ordered lists of numbers representing features.",
        "Matrices are grids of numbers, often batches of vectors.",
        "The dot product weights and sums two vectors into one number.",
        "Matrix multiplication is how model layers transform data at scale.",
      ],
    },
    {
      title: "Probability & Statistics for ML",
      description: "The core statistical ideas — distributions, mean, variance, and probability — that make sense of data and model outputs.",
      estimatedMinutes: 22,
      difficulty: "BEGINNER",
      whatIsIt: "Probability measures how likely something is to happen (from 0, impossible, to 1, certain). Statistics describes patterns in data using numbers like the mean (average), variance/standard deviation (how spread out values are), and distributions (the overall shape of how values occur).",
      whyItMatters: "ML models constantly reason under uncertainty — a spam filter doesn't know for certain an email is spam, it estimates a probability. Understanding mean, spread, and distributions helps you interpret data, spot outliers, and understand what a model's confidence score actually means.",
      analogy: "Think of a distribution like the spread of scores on a class test. The mean is the 'typical' score, the standard deviation tells you whether most students scored close to that typical score or wildly different from it, and probability is your best guess at how a new, unseen student might score, based on that pattern.",
      simpleExample: "If most delivery times cluster around 30 minutes with a few outliers taking 90 minutes, the mean might be 35 minutes, but the standard deviation reveals that '35 minutes' alone hides a lot of variation.",
      technicalExplanation: "The mean is the sum of values divided by their count. Variance is the average squared deviation from the mean, and standard deviation is its square root, expressed in the same units as the data. A probability distribution (like the normal/Gaussian distribution) describes how likely different outcomes are; many ML techniques assume or estimate such distributions, and classifiers often output a probability via functions like softmax.",
      codeExamples: [
        {
          title: "Computing mean, standard deviation, and a probability estimate",
          language: "python",
          code: "import numpy as np\n\ndelivery_times = np.array([28, 31, 29, 90, 30, 32, 27])\nmean = delivery_times.mean()\nstd = delivery_times.std()\nprint(f\"Mean: {mean:.1f}, Std Dev: {std:.1f}\")\n\n# Rough probability a new delivery takes longer than 45 minutes\nprob_late = np.mean(delivery_times > 45)\nprint(f\"P(late) ~ {prob_late:.2f}\")",
          explanation: "`.mean()` and `.std()` summarize the center and spread of the data. The final line estimates a simple empirical probability by checking what fraction of past deliveries exceeded 45 minutes — a basic but genuine way probability shows up in real analysis.",
        },
      ],
      realWorldUsage: "Probability and statistics underlie A/B testing, confidence intervals on model metrics, anomaly detection (flagging statistically unusual values), and the probability scores produced by classifiers (e.g. '92% confidence this is a cat').",
      commonMistakes: [
        {
          wrong: "Reporting only the mean of a dataset and ignoring its spread (standard deviation).",
          right: "Always look at spread alongside the mean — two datasets can have identical means but wildly different variability.",
          explanation: "A mean alone can hide outliers or high variance that materially changes how trustworthy or actionable that average really is.",
        },
      ],
      practice: {
        instructions: "Given a list of 8 exam scores of your choosing, compute the mean and standard deviation using NumPy. Then compute what fraction of scores fall below the mean.",
        hint: "`scores.mean()`, `scores.std()`, and boolean indexing (`scores < scores.mean()`).mean() give you all three answers.",
      },
      quiz: [
        {
          question: "What does standard deviation measure?",
          options: [
            "The most frequent value in a dataset",
            "How spread out values are around the mean",
            "The total number of data points",
            "The maximum value in a dataset",
          ],
          correctIndex: 1,
          explanation: "Standard deviation quantifies typical distance from the mean — low values mean data clusters tightly, high values mean it's spread widely.",
        },
        {
          question: "Why do classifiers often output a probability instead of a hard yes/no?",
          options: [
            "Probabilities are easier to store",
            "It communicates the model's confidence and uncertainty about the prediction",
            "It's required by Python syntax",
            "Probabilities always sum to exactly 100",
          ],
          correctIndex: 1,
          explanation: "A probability score lets downstream systems (or humans) weigh how confident the model is, rather than treating every prediction as equally certain.",
        },
      ],
      rememberThis: "The mean tells you the center of the story; the standard deviation tells you how wild the story really is.",
      keyTakeaways: [
        "Mean summarizes the center of a dataset; standard deviation summarizes its spread.",
        "Probability quantifies uncertainty on a 0-to-1 scale.",
        "Distributions describe the overall shape of how data occurs.",
        "Model confidence scores are a direct application of probability.",
      ],
    },
    {
      title: "Calculus Intuition: Derivatives and Gradients",
      description: "Understanding what a gradient really is and why it's the compass ML models use to improve.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "A derivative measures how fast a function's output changes as its input changes slightly — essentially, the 'slope' at a point. A gradient is the derivative generalized to functions with many inputs, pointing in the direction of steepest increase.",
      whyItMatters: "Training a model means searching for the settings (weights) that minimize error. Gradients tell the model exactly which direction to adjust each weight to reduce that error fastest — without calculus-based gradients, models would have no efficient way to learn from mistakes.",
      analogy: "Imagine standing on a foggy hillside, trying to reach the lowest point, but you can only feel the ground right under your feet. The slope beneath you (the gradient) tells you which direction is downhill and how steep it is. Taking a step in that direction, over and over, eventually gets you to the valley — that's exactly what gradient descent does with a model's error.",
      simpleExample: "If increasing a bakery's oven temperature by 1 degree increases burnt loaves by 3, the 'derivative' of burnt-loaves with respect to temperature is roughly 3 — a rate of change, not just a raw count.",
      technicalExplanation: "For a function f(x), the derivative f'(x) gives the instantaneous rate of change at x. For a multivariable function like a model's loss L(w1, w2, ..., wn), the gradient ∇L is a vector of partial derivatives, one per weight, indicating how much the loss changes as each weight changes. Gradient descent updates each weight by moving a small step in the negative gradient direction (opposite the direction of steepest increase), since that decreases the loss.",
      codeExamples: [
        {
          title: "Approximating a derivative numerically",
          language: "python",
          code: "def loss(w):\n    return (w - 4) ** 2  # minimum at w = 4\n\ndef numerical_gradient(f, w, h=1e-5):\n    return (f(w + h) - f(w - h)) / (2 * h)\n\nw = 1.0\nfor step in range(5):\n    grad = numerical_gradient(loss, w)\n    w = w - 0.1 * grad  # move against the gradient\n    print(f\"w={w:.3f}, loss={loss(w):.3f}\")",
          explanation: "`numerical_gradient` estimates the slope of the loss at the current weight by nudging it slightly in both directions. Each loop iteration moves `w` a small step opposite the gradient, and you can watch `w` converge toward 4, where the loss is minimized — this is gradient descent in miniature.",
        },
      ],
      realWorldUsage: "Gradient descent (and its variants like Adam and SGD) is the training algorithm behind virtually every neural network, from small classifiers to massive language models — all learning by repeatedly following gradients downhill.",
      commonMistakes: [
        {
          wrong: "Assuming a bigger learning rate (step size) always trains a model faster.",
          right: "Understand that too large a step can overshoot the minimum and diverge, while too small a step makes training painfully slow — the learning rate needs tuning.",
          explanation: "The learning rate controls how far each gradient step moves; it's a critical hyperparameter, not something to maximize blindly.",
        },
      ],
      practice: {
        instructions: "Using the numerical_gradient code above, change the target minimum in `loss(w)` to a different number (e.g. 10) and the starting `w` to a different value. Run it and observe whether it still converges.",
        hint: "Try also changing the step size (0.1) to something much larger, like 1.5, and see what happens to convergence.",
      },
      quiz: [
        {
          question: "What does a gradient represent for a model's loss function?",
          options: [
            "The total number of training examples",
            "The direction and rate of steepest increase in the loss",
            "The model's final accuracy",
            "A random number used for initialization",
          ],
          correctIndex: 1,
          explanation: "The gradient points toward steepest increase; moving opposite it decreases the loss, which is the core idea of gradient descent.",
        },
        {
          question: "What can happen if the learning rate is set too high?",
          options: [
            "Training becomes perfectly accurate instantly",
            "The weight updates can overshoot the minimum and fail to converge",
            "Nothing changes",
            "The gradient becomes zero permanently",
          ],
          correctIndex: 1,
          explanation: "Too large a step size can cause weights to jump past the minimum repeatedly, sometimes making the loss worse rather than better.",
        },
      ],
      rememberThis: "The gradient is your compass in the fog: it doesn't show the whole hillside, just which direction downhill is right now.",
      keyTakeaways: [
        "A derivative measures the rate of change of a function at a point.",
        "A gradient generalizes this to many inputs, pointing toward steepest increase.",
        "Gradient descent moves weights opposite the gradient to reduce loss.",
        "The learning rate controls step size and must be tuned carefully.",
      ],
    },
  ],
};

const machineLearning: CurriculumModuleDef = {
  name: "Machine Learning",
  description: "The classical algorithms that learn patterns from data — from predicting numbers to grouping unlabeled examples.",
  estimatedDuration: "3 weeks",
  lessons: [
    {
      title: "Supervised Learning: Regression",
      description: "Predicting continuous numeric values from labeled examples, starting with linear regression.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "Regression is a type of supervised learning where the model learns to predict a continuous number (like a price, temperature, or time) based on input features, by studying past examples where the correct answer was already known.",
      whyItMatters: "Countless real problems boil down to 'predict a number given some inputs' — house prices, delivery times, demand forecasts. Regression gives a simple, interpretable starting point for all of them.",
      analogy: "Think of a real-estate agent who has seen hundreds of home sales. Over time, they intuitively learn that bigger houses in better locations sell for more, and can estimate a new house's price from its features. Linear regression formalizes that intuition into a precise, adjustable formula.",
      simpleExample: "Given past data of house size vs. price, a regression model learns a formula like price ≈ 100 × size + 20,000, then uses it to estimate the price of a brand-new house it has never seen.",
      technicalExplanation: "Linear regression fits a line (or hyperplane, in higher dimensions) y = w1x1 + w2x2 + ... + b that minimizes the sum of squared errors between predicted and actual values. The weights (w) and bias (b) are learned via gradient descent or a closed-form solution. Performance is often measured using Mean Squared Error (MSE) or R² (how much variance in the target the model explains).",
      codeExamples: [
        {
          title: "Training a linear regression model with scikit-learn",
          language: "python",
          code: "from sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)         # learns weights from labeled data\n\npredictions = model.predict(X_test)\nmse = mean_squared_error(y_test, predictions)\nprint(f\"MSE: {mse:.2f}, Coefficients: {model.coef_}\")",
          explanation: "`.fit()` learns the best-fitting weights from training features (X_train) and known targets (y_train). `.predict()` applies that learned formula to new data, and `mean_squared_error` measures how far off the predictions were, on average, squared.",
        },
      ],
      realWorldUsage: "Regression powers house-price estimators, sales forecasting, predicting delivery ETAs, estimating a user's likely spend, and any system that needs to output a continuous numeric prediction.",
      commonMistakes: [
        {
          wrong: "Assuming a linear regression model will fit any relationship well, even clearly non-linear ones.",
          right: "Plot the data first, or check residuals, to confirm a roughly linear relationship exists before relying on linear regression — otherwise consider polynomial features or a different model.",
          explanation: "Linear regression can only represent straight-line relationships between features and the target; forcing it onto curved relationships produces systematically biased predictions.",
        },
      ],
      practice: {
        instructions: "Using scikit-learn's built-in California housing dataset (or any small numeric dataset), split it into train/test sets, train a LinearRegression model, and print the MSE on the test set.",
        hint: "`from sklearn.datasets import fetch_california_housing` and `from sklearn.model_selection import train_test_split`.",
      },
      quiz: [
        {
          question: "What kind of output does a regression model predict?",
          options: ["A category/class label", "A continuous numeric value", "An image", "A yes/no decision only"],
          correctIndex: 1,
          explanation: "Regression is specifically for predicting continuous quantities, unlike classification which predicts discrete categories.",
        },
        {
          question: "What does Mean Squared Error (MSE) measure?",
          options: [
            "The number of features in the dataset",
            "The average squared difference between predicted and actual values",
            "The model's training time",
            "The number of correct classifications",
          ],
          correctIndex: 1,
          explanation: "MSE penalizes larger errors more heavily (because errors are squared) and gives an overall sense of prediction accuracy for numeric targets.",
        },
      ],
      rememberThis: "Regression is the real-estate agent's intuition, turned into a formula that can be tuned and reused on any new house.",
      keyTakeaways: [
        "Regression predicts continuous numeric outputs from labeled data.",
        "Linear regression fits a straight-line formula minimizing squared error.",
        "MSE and R² are common ways to evaluate regression performance.",
        "Check that relationships are roughly linear before trusting linear regression.",
      ],
    },
    {
      title: "Supervised Learning: Classification",
      description: "Predicting discrete categories from labeled data, using logistic regression as the entry point.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "Classification is supervised learning where the model predicts a discrete category (like 'spam' vs 'not spam', or 'cat' vs 'dog' vs 'bird') instead of a continuous number, again by learning from labeled examples.",
      whyItMatters: "Many high-value problems are fundamentally about sorting things into buckets — fraud or not, disease or healthy, which product category. Classification is the tool for exactly that.",
      analogy: "Classification is like a mail sorter standing at a conveyor belt, quickly deciding which bin each letter belongs in based on features like the address format and postage. They don't measure a number — they make a categorical decision, over and over, getting faster and more accurate with experience.",
      simpleExample: "Given emails labeled 'spam' or 'not spam' along with features like 'contains the word free' and 'number of links', a classifier learns to predict the category of new, unseen emails.",
      technicalExplanation: "Logistic regression, despite its name, is a classification algorithm: it computes a weighted sum of features and passes it through a sigmoid function to produce a probability between 0 and 1, which is thresholded (commonly at 0.5) to produce a class prediction. Multi-class problems extend this via strategies like one-vs-rest or softmax. Models are trained by minimizing a loss function such as cross-entropy, which penalizes confident wrong predictions heavily.",
      codeExamples: [
        {
          title: "Training a logistic regression classifier",
          language: "python",
          code: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\npredictions = model.predict(X_test)\nprobabilities = model.predict_proba(X_test)  # confidence per class\n\nprint(f\"Accuracy: {accuracy_score(y_test, predictions):.2f}\")",
          explanation: "`.fit()` learns the decision boundary from labeled examples. `.predict()` returns the predicted class, while `.predict_proba()` returns the underlying probability estimates for each class — useful when you care about confidence, not just the final label.",
        },
      ],
      realWorldUsage: "Classification drives spam filters, fraud detection, medical diagnosis support tools, sentiment analysis, and image recognition (is this a cat, dog, or neither).",
      commonMistakes: [
        {
          wrong: "Judging a classifier only by accuracy, even on a dataset where 95% of examples belong to one class.",
          right: "Check precision, recall, and the confusion matrix, especially on imbalanced datasets — a model predicting the majority class every time can still score 95% accuracy while being useless.",
          explanation: "Accuracy hides how well a model handles the minority class, which is often the class that matters most (e.g., detecting the rare fraud cases).",
        },
      ],
      practice: {
        instructions: "Using scikit-learn's built-in breast cancer dataset, train a LogisticRegression classifier and print both its accuracy and its confusion matrix on the test set.",
        hint: "`from sklearn.datasets import load_breast_cancer` and `from sklearn.metrics import confusion_matrix`.",
      },
      quiz: [
        {
          question: "What does logistic regression output before thresholding into a class?",
          options: ["A random integer", "A probability between 0 and 1", "An image", "A raw unbounded number with no meaning"],
          correctIndex: 1,
          explanation: "Logistic regression applies a sigmoid function to a weighted sum, squashing it into a 0-to-1 probability, which is then thresholded to pick a class.",
        },
        {
          question: "Why can accuracy be misleading on an imbalanced dataset?",
          options: [
            "Accuracy is never calculated correctly by libraries",
            "A model can score high accuracy just by always predicting the majority class",
            "Accuracy only works for regression",
            "Imbalanced datasets can't be classified at all",
          ],
          correctIndex: 1,
          explanation: "If 95% of examples are one class, always predicting that class yields 95% accuracy while completely failing at the minority class.",
        },
      ],
      rememberThis: "A classifier is a mail sorter: not measuring a number, just deciding which bin each new example belongs in.",
      keyTakeaways: [
        "Classification predicts discrete categories, not continuous numbers.",
        "Logistic regression outputs probabilities via the sigmoid function.",
        "Cross-entropy loss penalizes confident wrong predictions.",
        "Use precision/recall/confusion matrix, not just accuracy, on imbalanced data.",
      ],
    },
    {
      title: "Decision Trees & Random Forests",
      description: "Learning by asking a sequence of yes/no questions, and why a forest of trees beats a single one.",
      estimatedMinutes: 22,
      difficulty: "INTERMEDIATE",
      whatIsIt: "A decision tree predicts an outcome by asking a series of yes/no questions about the features (like 'is age > 30?'), branching based on the answer, until it reaches a final prediction. A random forest trains many different decision trees on random subsets of data and features, then averages or votes on their predictions.",
      whyItMatters: "Decision trees are easy to interpret — you can literally read the questions that led to a prediction. Random forests fix trees' main weakness (overfitting to their specific training data) by combining many imperfect trees into a more robust, accurate model.",
      analogy: "A single decision tree is like one doctor diagnosing you based on a fixed checklist of questions — useful, but prone to their individual blind spots. A random forest is like getting independent opinions from a hundred doctors, each trained slightly differently and looking at different symptoms, then going with the majority verdict — far more reliable than trusting any one doctor alone.",
      simpleExample: "To predict if someone will like a movie, a tree might first ask 'is it an action movie?', then 'is the runtime under 2 hours?', branching toward a final yes/no prediction based on the answers.",
      technicalExplanation: "A decision tree recursively splits data on the feature and threshold that most reduces impurity (measured by Gini impurity or entropy for classification, variance reduction for regression), forming a hierarchy of if/else rules. Deep trees tend to overfit by memorizing training data. Random forests reduce this by bagging — training each tree on a bootstrapped sample of the data and a random subset of features — then aggregating predictions (majority vote for classification, average for regression), which reduces variance without much increase in bias.",
      codeExamples: [
        {
          title: "Comparing a single tree to a random forest",
          language: "python",
          code: "from sklearn.tree import DecisionTreeClassifier\nfrom sklearn.ensemble import RandomForestClassifier\n\ntree = DecisionTreeClassifier(max_depth=5)\ntree.fit(X_train, y_train)\nprint('Single tree accuracy:', tree.score(X_test, y_test))\n\nforest = RandomForestClassifier(n_estimators=100, max_depth=5)\nforest.fit(X_train, y_train)\nprint('Random forest accuracy:', forest.score(X_test, y_test))",
          explanation: "Both models are trained the same way, but `RandomForestClassifier` builds 100 trees on randomized subsets of data/features and combines their votes, typically generalizing better to unseen data than any single tree.",
        },
      ],
      realWorldUsage: "Random forests are widely used in credit scoring, churn prediction, medical risk models, and as strong baseline models in tabular-data competitions, because they perform well with minimal tuning and handle mixed feature types gracefully.",
      commonMistakes: [
        {
          wrong: "Letting a single decision tree grow without any depth limit, then being surprised it performs great on training data but poorly on new data.",
          right: "Limit tree depth (or use a random forest) and validate on held-out data — an unconstrained tree memorizes noise in the training set.",
          explanation: "Deep, unconstrained trees can create a unique branch for nearly every training example, which is textbook overfitting.",
        },
      ],
      practice: {
        instructions: "Train both a DecisionTreeClassifier and a RandomForestClassifier on the same dataset with the same max_depth. Compare their test accuracy and discuss why the forest tends to generalize better.",
        hint: "Try varying `n_estimators` in the forest (e.g. 10 vs 200) to see how it affects test accuracy.",
      },
      quiz: [
        {
          question: "How does a random forest reduce overfitting compared to a single decision tree?",
          options: [
            "It uses a bigger dataset automatically",
            "It combines many trees trained on random subsets of data and features, averaging out individual errors",
            "It removes all branching decisions",
            "It only works on regression problems",
          ],
          correctIndex: 1,
          explanation: "Bagging (bootstrap aggregating) trains diverse trees and combines their votes, which cancels out individual trees' overfitting tendencies.",
        },
        {
          question: "What is a key advantage of a single decision tree over many other ML models?",
          options: [
            "It is always the most accurate model",
            "Its decisions are easy to interpret as a sequence of if/else rules",
            "It requires no training data",
            "It cannot overfit",
          ],
          correctIndex: 1,
          explanation: "A shallow decision tree's logic can be read directly as a flowchart of questions, making it one of the most interpretable ML models.",
        },
      ],
      rememberThis: "One doctor's checklist can be wrong; a hundred independent doctors voting rarely are — that's a tree versus a forest.",
      keyTakeaways: [
        "Decision trees split data via a sequence of feature-based questions.",
        "Deep trees overfit by memorizing training data.",
        "Random forests combine many trees trained on random subsets for robustness.",
        "Forests trade some interpretability for significantly better generalization.",
      ],
    },
    {
      title: "Support Vector Machines (SVM)",
      description: "Finding the widest possible boundary between classes for maximum-margin classification.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "A Support Vector Machine is a classification algorithm that finds the boundary (a line, plane, or curved surface) that separates classes with the widest possible margin — the largest buffer zone between the closest points of each class.",
      whyItMatters: "A boundary that barely squeezes between classes is fragile — small changes in new data can cause misclassification. SVMs deliberately maximize the safety margin, which tends to generalize better to new, unseen data.",
      analogy: "Imagine drawing a road between two neighborhoods so that no house from either side gets too close to the road. SVM doesn't just draw any road that separates them — it finds the widest possible road, using only the houses closest to the boundary (the 'support vectors') to decide exactly where that road goes.",
      simpleExample: "To separate spam from non-spam emails plotted by two features, an SVM doesn't just find any line between them — it finds the one line that keeps the largest possible gap from the nearest emails on both sides.",
      technicalExplanation: "SVM finds the hyperplane that maximizes the margin between classes, defined only by the closest data points (support vectors) — all other points don't affect the boundary. For data that isn't linearly separable, the kernel trick (e.g. RBF kernel) implicitly maps data into a higher-dimensional space where a linear separator does exist, without explicitly computing that transformation. A regularization parameter (C) trades off margin width against misclassification tolerance.",
      codeExamples: [
        {
          title: "Training an SVM classifier with an RBF kernel",
          language: "python",
          code: "from sklearn.svm import SVC\n\nmodel = SVC(kernel='rbf', C=1.0)\nmodel.fit(X_train, y_train)\n\naccuracy = model.score(X_test, y_test)\nprint(f\"SVM accuracy: {accuracy:.2f}\")\nprint(f\"Number of support vectors: {len(model.support_vectors_)}\")",
          explanation: "`kernel='rbf'` lets the SVM handle non-linear boundaries by implicitly projecting data into higher dimensions. `model.support_vectors_` reveals exactly which training points ended up defining the decision boundary.",
        },
      ],
      realWorldUsage: "SVMs are used in text classification, image classification (especially with smaller datasets), bioinformatics (gene classification), and any setting with clear margins between classes and moderate dataset sizes.",
      commonMistakes: [
        {
          wrong: "Using an SVM on a huge dataset (millions of rows) and expecting fast training with default settings.",
          right: "Recognize that standard SVMs scale poorly to very large datasets; consider linear SVM variants or a different model family (like gradient boosting or neural nets) for big data.",
          explanation: "Kernel SVM training complexity grows roughly quadratically or worse with the number of samples, making it impractical for very large datasets.",
        },
      ],
      practice: {
        instructions: "Train an SVC classifier with kernel='linear' and another with kernel='rbf' on the same dataset. Compare their test accuracy and think about why they might differ.",
        hint: "Try a dataset where classes aren't perfectly linearly separable (like scikit-learn's `make_moons`) to see the RBF kernel's advantage.",
      },
      quiz: [
        {
          question: "What does an SVM try to maximize when finding a decision boundary?",
          options: [
            "The number of support vectors",
            "The margin (gap) between the boundary and the nearest points of each class",
            "The total number of training examples",
            "The depth of the decision boundary",
          ],
          correctIndex: 1,
          explanation: "SVM specifically seeks the widest possible margin, which is what distinguishes it from simply finding any separating boundary.",
        },
        {
          question: "What does the kernel trick allow an SVM to do?",
          options: [
            "Train without any data",
            "Handle non-linearly separable data by implicitly mapping it to a higher-dimensional space",
            "Skip the training process entirely",
            "Always guarantee 100% accuracy",
          ],
          correctIndex: 1,
          explanation: "Kernels let SVMs find non-linear boundaries in the original space by effectively operating in a transformed, higher-dimensional space.",
        },
      ],
      rememberThis: "SVM doesn't just build a road between neighborhoods — it builds the widest one it possibly can.",
      keyTakeaways: [
        "SVMs find the maximum-margin boundary between classes.",
        "Only the closest points (support vectors) determine the boundary.",
        "Kernels enable non-linear decision boundaries.",
        "SVMs scale poorly to very large datasets compared to other models.",
      ],
    },
    {
      title: "K-Nearest Neighbors (KNN)",
      description: "Classifying new data by simply looking at what its closest neighbors are.",
      estimatedMinutes: 16,
      difficulty: "INTERMEDIATE",
      whatIsIt: "K-Nearest Neighbors predicts a label for a new data point by looking at the 'k' most similar examples already seen (its nearest neighbors in feature space) and taking a majority vote (for classification) or an average (for regression) of their labels.",
      whyItMatters: "KNN requires no real 'training' step and makes almost no assumptions about the underlying data pattern — it's a simple, intuitive baseline that works surprisingly well when similar things really do behave similarly.",
      analogy: "KNN is like guessing a house's price by looking at the five most similar houses that recently sold nearby, and averaging their prices. You're not building a formula — you're just trusting that similar things behave similarly.",
      simpleExample: "To decide if a new fruit is an apple or an orange based on weight and color, KNN looks at the 5 most similar fruits already labeled, and goes with whichever label is most common among them.",
      technicalExplanation: "For a new point, KNN computes a distance metric (commonly Euclidean distance) to every point in the training set, selects the k closest ones, and aggregates their labels — majority vote for classification, mean for regression. There's no explicit training phase (it's a 'lazy learner'); all computation happens at prediction time. The choice of k matters a lot: small k is sensitive to noise, large k oversmooths and can blur class boundaries. Feature scaling is essential since distance is sensitive to units.",
      codeExamples: [
        {
          title: "Classifying with K-Nearest Neighbors",
          language: "python",
          code: "from sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)\n\nmodel = KNeighborsClassifier(n_neighbors=5)\nmodel.fit(X_train_scaled, y_train)\nprint('Accuracy:', model.score(X_test_scaled, y_test))",
          explanation: "Features are scaled first, since KNN's distance calculations are skewed by features with larger numeric ranges. `n_neighbors=5` means each prediction is based on a majority vote among the 5 closest training examples.",
        },
      ],
      realWorldUsage: "KNN is used in recommendation systems (find users similar to you), anomaly detection (points with no close neighbors are outliers), and as a quick, interpretable baseline before trying more complex models.",
      commonMistakes: [
        {
          wrong: "Running KNN directly on unscaled features where one feature (like income in thousands) dominates another (like age in years).",
          right: "Scale all features (e.g. with StandardScaler) before computing distances, so every feature contributes fairly.",
          explanation: "Since KNN relies purely on distance, a feature with a much larger numeric range will dominate the distance calculation and effectively drown out other features.",
        },
      ],
      practice: {
        instructions: "Train a KNeighborsClassifier with k=1, k=5, and k=15 on the same dataset (with scaled features). Compare test accuracy across the three values and note any pattern.",
        hint: "Very small k tends to overfit to noise; very large k tends to oversmooth — look for where accuracy peaks.",
      },
      quiz: [
        {
          question: "How does KNN make a prediction for a new data point?",
          options: [
            "It fits a mathematical formula ahead of time",
            "It looks at the k closest labeled examples and votes/averages their labels",
            "It randomly guesses",
            "It requires no data at all",
          ],
          correctIndex: 1,
          explanation: "KNN is instance-based: predictions come directly from the labels of the nearest training examples, computed at prediction time.",
        },
        {
          question: "Why is feature scaling especially important for KNN?",
          options: [
            "It isn't important for KNN",
            "KNN relies on distance calculations, which are skewed by features with larger numeric ranges",
            "Scaling makes training faster only",
            "KNN cannot run on numeric data without scaling",
          ],
          correctIndex: 1,
          explanation: "Unscaled features with large ranges dominate the distance metric, effectively ignoring other, differently-scaled features.",
        },
      ],
      rememberThis: "KNN doesn't learn a rule — it just asks its nearest neighbors what they think, and goes with the majority.",
      keyTakeaways: [
        "KNN predicts based on the majority label among the k nearest training points.",
        "It has no real training phase — all work happens at prediction time.",
        "The choice of k trades off sensitivity to noise vs. oversmoothing.",
        "Feature scaling is essential since KNN relies on distance.",
      ],
    },
    {
      title: "Unsupervised Learning & Clustering",
      description: "Finding hidden structure in data that has no labels at all, using K-Means clustering.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "Unsupervised learning finds patterns in data without any labeled 'correct answers'. Clustering, its most common form, groups similar data points together into clusters, discovering structure the data itself suggests rather than structure you already told the model about.",
      whyItMatters: "Often you don't have labels — you just have raw data and want to know 'what natural groups exist here?' Clustering is essential for customer segmentation, anomaly discovery, and exploring a dataset before you even know what questions to ask.",
      analogy: "Clustering is like being handed a huge box of mixed buttons with no labels and asked to sort them into piles that make sense — by color, size, or shape. Nobody told you the categories in advance; you discover them by noticing which buttons naturally belong together.",
      simpleExample: "Given customer purchase data with no predefined categories, clustering might reveal three natural groups: bargain hunters, frequent big spenders, and occasional browsers — patterns nobody explicitly labeled beforehand.",
      technicalExplanation: "K-Means clustering partitions data into k clusters by iteratively: (1) assigning each point to its nearest cluster centroid, and (2) recomputing each centroid as the mean of its assigned points, repeating until assignments stabilize. The number of clusters (k) must be chosen in advance, often guided by the 'elbow method' (plotting within-cluster variance against k and looking for a bend) or domain knowledge.",
      codeExamples: [
        {
          title: "Clustering customers with K-Means",
          language: "python",
          code: "from sklearn.cluster import KMeans\n\nkmeans = KMeans(n_clusters=3, random_state=42)\ncluster_labels = kmeans.fit_predict(X_customers)\n\nprint('Cluster assignments:', cluster_labels[:10])\nprint('Cluster centers:', kmeans.cluster_centers_)",
          explanation: "`fit_predict` both trains the model and assigns each customer to one of 3 clusters in a single step. `cluster_centers_` shows the 'average' customer profile at the center of each discovered group.",
        },
      ],
      realWorldUsage: "Clustering is used for customer segmentation in marketing, grouping similar documents or images, anomaly detection (points far from any cluster), and as a preprocessing step to compress or organize large unlabeled datasets.",
      commonMistakes: [
        {
          wrong: "Picking an arbitrary number of clusters (k) without any justification and treating the result as ground truth.",
          right: "Use the elbow method, silhouette scores, or domain knowledge to justify the choice of k, and treat clusters as a hypothesis to validate, not an absolute truth.",
          explanation: "K-Means always produces exactly k clusters, whether or not that many meaningful groups actually exist in the data — the choice of k directly shapes the outcome.",
        },
      ],
      practice: {
        instructions: "Generate a synthetic dataset with scikit-learn's `make_blobs` (with a known number of clusters), then run KMeans with a few different values of k and observe how the results compare to the true structure.",
        hint: "`from sklearn.datasets import make_blobs` with `centers=4` gives you a dataset with a known correct number of clusters to compare against.",
      },
      quiz: [
        {
          question: "What is the key difference between supervised and unsupervised learning?",
          options: [
            "Supervised learning uses labeled data; unsupervised learning does not",
            "Unsupervised learning always requires more data",
            "There is no real difference",
            "Supervised learning never uses numeric data",
          ],
          correctIndex: 0,
          explanation: "Supervised learning learns from labeled examples with known correct answers; unsupervised learning finds structure in data with no such labels.",
        },
        {
          question: "In K-Means, what does each cluster centroid represent?",
          options: [
            "A single random data point",
            "The mean position of all points currently assigned to that cluster",
            "The very first point added to the cluster",
            "A manually labeled category",
          ],
          correctIndex: 1,
          explanation: "Centroids are recalculated each iteration as the average of the points currently assigned to that cluster.",
        },
      ],
      rememberThis: "Clustering sorts a box of unlabeled buttons into piles that make sense — nobody handed you the categories, the data suggested them.",
      keyTakeaways: [
        "Unsupervised learning finds patterns without labeled answers.",
        "K-Means partitions data into k clusters by iteratively updating centroids.",
        "The number of clusters (k) must be chosen and justified, not assumed.",
        "Clustering is widely used for segmentation and exploratory analysis.",
      ],
    },
    {
      title: "Feature Engineering",
      description: "Shaping raw data into the inputs that actually help a model learn.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "Feature engineering is the process of creating, transforming, or selecting the input variables (features) fed into a model, so that the useful signal in the data is easier for the model to pick up on.",
      whyItMatters: "A model can only learn from the features it's given. A well-engineered feature (like 'days since last purchase' instead of raw timestamps) can turn a mediocre model into an excellent one, often mattering more than which algorithm you choose.",
      analogy: "Raw data is like unprocessed ingredients — flour, eggs, sugar. Feature engineering is turning them into batter: the right combination and preparation makes it far easier for the 'oven' (the model) to produce something good, even though the ingredients are technically the same.",
      simpleExample: "A raw 'date of birth' field isn't very useful to a model directly, but engineering it into 'age in years' turns it into a feature the model can actually use to find meaningful patterns.",
      technicalExplanation: "Feature engineering includes: encoding categorical variables (one-hot encoding, label encoding), scaling numeric features (standardization, normalization), creating interaction terms (multiplying two features together), extracting components from dates/text, handling missing values thoughtfully, and selecting or removing features based on relevance (feature selection) to reduce noise and overfitting.",
      codeExamples: [
        {
          title: "One-hot encoding and creating a derived feature",
          language: "python",
          code: "import pandas as pd\n\ndf = pd.DataFrame({\n    'city': ['Delhi', 'Mumbai', 'Delhi'],\n    'signup_date': pd.to_datetime(['2023-01-15', '2022-06-10', '2023-03-01']),\n})\n\ndf_encoded = pd.get_dummies(df, columns=['city'])\ndf_encoded['days_since_signup'] = (pd.Timestamp('2024-01-01') - df['signup_date']).dt.days\nprint(df_encoded)",
          explanation: "`pd.get_dummies` converts the categorical 'city' column into separate binary columns a model can use numerically. `days_since_signup` is a derived feature — turning a raw date into a meaningful numeric measure of recency.",
        },
      ],
      realWorldUsage: "Feature engineering is central to fraud detection (deriving 'transactions in the last hour'), recommendation systems (deriving 'average rating given by this user'), and virtually every tabular ML pipeline in production.",
      commonMistakes: [
        {
          wrong: "Feeding a categorical column directly into a model as raw text or arbitrary numeric codes without proper encoding.",
          right: "Use one-hot encoding (for unordered categories) or a principled ordinal encoding (for genuinely ordered categories) so the model doesn't infer a false numeric relationship.",
          explanation: "If 'Delhi'=1, 'Mumbai'=2, 'Chennai'=3 are used directly, the model may wrongly assume Chennai is 'greater than' Delhi in some meaningful numeric sense.",
        },
      ],
      practice: {
        instructions: "Given a DataFrame with a 'purchase_amount' column and a 'category' column (e.g. 'electronics', 'clothing'), one-hot encode the category column and create a new feature 'is_high_value' that is True when purchase_amount is above the column's median.",
        hint: "`pd.get_dummies(df, columns=['category'])` and `df['purchase_amount'] > df['purchase_amount'].median()`.",
      },
      quiz: [
        {
          question: "What is the main goal of feature engineering?",
          options: [
            "Making the dataset file smaller",
            "Shaping raw data into inputs that make useful patterns easier for the model to learn",
            "Removing all missing values regardless of impact",
            "Increasing the number of rows in a dataset",
          ],
          correctIndex: 1,
          explanation: "Feature engineering is about representing the underlying signal in the data in a form the model can actually exploit.",
        },
        {
          question: "Why can directly numeric-encoding unordered categories (e.g. city names as 1, 2, 3) be a mistake?",
          options: [
            "It uses too much memory",
            "It implies a false numeric ordering/relationship between categories that don't actually have one",
            "Models cannot process any encoded categories",
            "It's always faster to leave text as-is",
          ],
          correctIndex: 1,
          explanation: "Arbitrary numeric codes for unordered categories can mislead models that assume numeric relationships (like distance or ordering) between values.",
        },
      ],
      rememberThis: "Feature engineering is turning raw ingredients into batter — same information, but shaped so the model can actually use it.",
      keyTakeaways: [
        "Feature engineering shapes raw data into model-friendly inputs.",
        "Encoding, scaling, and derived features are common techniques.",
        "Good features often matter more than model choice.",
        "Encode unordered categories carefully to avoid implying false relationships.",
      ],
    },
    {
      title: "Model Evaluation Metrics",
      description: "Choosing the right metric to honestly judge whether a model is actually good.",
      estimatedMinutes: 20,
      difficulty: "INTERMEDIATE",
      whatIsIt: "Model evaluation metrics are numeric ways of measuring how well a model's predictions match reality — different metrics highlight different aspects of performance, from overall correctness to how well it catches rare but important cases.",
      whyItMatters: "The 'best' model depends entirely on which mistakes matter most. A cancer-screening model and a movie-recommendation model should absolutely not be judged by the same metric — choosing the wrong one can make a genuinely bad model look great.",
      analogy: "Judging a model only by accuracy is like judging a weather forecaster only by 'percentage of days correctly labeled as not-a-hurricane'. In a place where hurricanes are rare, forecasting 'no hurricane' every single day gets you great accuracy — while completely missing the one prediction that actually mattered.",
      simpleExample: "In a rare-disease detection model, catching every actual sick patient (high recall) usually matters more than avoiding a few unnecessary follow-up tests on healthy patients.",
      technicalExplanation: "For classification: accuracy is (correct predictions)/(total), precision is (true positives)/(predicted positives) — how many flagged cases were real, recall is (true positives)/(actual positives) — how many real cases were caught, and F1 is the harmonic mean balancing precision and recall. A confusion matrix breaks down true/false positives/negatives directly. For regression: MSE, RMSE, and MAE measure average prediction error, while R² measures the proportion of variance explained.",
      codeExamples: [
        {
          title: "Full classification evaluation report",
          language: "python",
          code: "from sklearn.metrics import classification_report, confusion_matrix\n\npredictions = model.predict(X_test)\nprint(confusion_matrix(y_test, predictions))\nprint(classification_report(y_test, predictions))",
          explanation: "`confusion_matrix` shows exactly how many true/false positives and negatives occurred. `classification_report` prints precision, recall, and F1-score per class in one call — far more informative than accuracy alone.",
        },
      ],
      realWorldUsage: "Choosing the right metric is critical in medical diagnosis (favoring recall to avoid missing sick patients), fraud detection (balancing precision and recall to avoid both missed fraud and excessive false alarms), and search/recommendation ranking (using metrics like precision@k).",
      commonMistakes: [
        {
          wrong: "Reporting a single overall accuracy number as proof a model is 'good' without context.",
          right: "Match the metric to the business cost of different error types — decide whether false positives or false negatives are more costly, and pick precision, recall, F1, or another metric accordingly.",
          explanation: "Different mistakes have very different real-world costs; the right metric reflects what actually matters for the specific problem, not a generic default.",
        },
      ],
      practice: {
        instructions: "Train any classifier on an imbalanced dataset (or artificially imbalance one by dropping most examples of one class). Print accuracy, precision, recall, and F1-score, and explain in your own words why accuracy alone is misleading here.",
        hint: "`classification_report` from sklearn.metrics computes all of these for you in one call.",
      },
      quiz: [
        {
          question: "What does recall measure?",
          options: [
            "The fraction of all predictions that were correct",
            "The fraction of actual positive cases that the model correctly identified",
            "How fast the model runs",
            "The total number of features used",
          ],
          correctIndex: 1,
          explanation: "Recall focuses on catching real positive cases — a low recall means the model is missing many true positives.",
        },
        {
          question: "Why might precision matter more than recall in a spam filter?",
          options: [
            "Precision is always the correct metric everywhere",
            "Because falsely flagging a legitimate email as spam (a false positive) can be very costly to the user",
            "Recall cannot be computed for spam filters",
            "Spam filters don't need any evaluation",
          ],
          correctIndex: 1,
          explanation: "In spam filtering, users are often more harmed by losing a real email (false positive) than by an occasional spam email slipping through, so precision is prioritized.",
        },
      ],
      rememberThis: "A model judged only on accuracy is a forecaster judged only on how often they correctly said 'no hurricane' — technically impressive, practically useless.",
      keyTakeaways: [
        "Accuracy alone can hide poor performance on rare but important classes.",
        "Precision measures correctness of positive predictions; recall measures coverage of real positives.",
        "F1-score balances precision and recall into one number.",
        "Choose metrics based on which errors are actually costly for the problem.",
      ],
    },
  ],
};

export const curriculum: CurriculumCourseDef = {
  courseName: "AI & Machine Learning",
  modules: [pythonForAiMl, mathematicsForMl, machineLearning],
};
