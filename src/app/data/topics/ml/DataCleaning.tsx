import { Topic } from '../../coreJava';

export const dataCleaning: Topic = {
    id: 'ml-data-preprocessing-data-cleaning',
    name: 'Data Cleaning',
    beginner: [
        {
            content: `<h4>Fixing the Mess Before It Reaches a Model</h4>
<ul>
<li><strong>Data Cleaning</strong> is the umbrella process of finding and fixing problems in raw data - <strong>inconsistent categories</strong> ("NY" vs "New York" vs "new york"), <strong>invalid or impossible values</strong> (age = -5, age = 300), <strong>type mismatches</strong> (a numeric column with some text mixed in), and <strong>formatting issues</strong> (extra whitespace, inconsistent date formats).</li>
<li>It sits between <code>Data Collection</code> and the more specific preprocessing steps like <code>Missing Value Handling</code> and <code>Duplicate Handling</code> - cleaning is the broad pass that makes a raw dataset structurally trustworthy before those more targeted techniques are applied.</li>
<li>In real projects, data cleaning is famously the single most time-consuming step - commonly cited as consuming <strong>60-80% of total project time</strong>, far more than model training itself.</li>
</ul>`,
            codeExamples: [
                `import pandas as pd

df = pd.DataFrame({
    "customer_id": [1, 2, 3, 4, 5],
    "state": ["NY", "New York", "new york", "CA", "california"],
    "age": [34, -5, 300, 28, 41],
})

# Standardize inconsistent category text
df["state_clean"] = df["state"].str.strip().str.lower().replace({
    "ny": "new york",
    "new york": "new york",
    "california": "california",
    "ca": "california",
})

# Flag impossible values instead of blindly trusting them
df["age_valid"] = df["age"].between(0, 120)

print(df[["state", "state_clean", "age", "age_valid"]])
# OUTPUT:
#          state state_clean  age  age_valid
# 0           NY    new york   34       True
# 1     New York    new york   -5      False
# 2     new york    new york  300      False
# 3           CA  california   28       True
# 4  california  california   41       True`
            ],
            codeExplanations: [
                `The <code>state</code> column has the same real value written three different ways ("NY", "New York", "new york") - <code>str.strip().str.lower()</code> normalizes casing and stray whitespace first, then <code>.replace()</code> maps every known variant (including abbreviations) onto one canonical spelling, collapsing what looked like five categories into two real ones. Separately, <code>age.between(0, 120)</code> flags impossible values like <code>-5</code> and <code>300</code> as invalid rather than silently accepting them as real ages - cleaning here means DETECTING the problem explicitly (via <code>age_valid</code>) so a deliberate decision can be made about each flagged row, rather than either trusting bad data blindly or deleting it without checking.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Uncleaned data doesn't usually cause a crash - it causes a model that trains "successfully" on corrupted signal and produces confidently wrong predictions, which is far more dangerous because nothing visibly breaks.
<ul>
<li><strong>Inconsistent categories silently fragment real groups</strong> - if "New York" and "NY" are treated as two different categories, any model using <code>state</code> as a feature (or any groupby-based aggregate feature, like average sales per state) splits what should be one group's signal across two, weakening the pattern the model could have learned and wasting rows on effectively duplicate categories.</li>
<li><strong>Invalid values corrupt statistics used throughout the pipeline</strong> - a single <code>age = 300</code> row will drag up the column's mean, inflate its standard deviation, and distort any <code>Standardization</code> or outlier-detection step that relies on those statistics, even though it is one obviously wrong row out of thousands.</li>
<li><strong>Type mismatches break operations far downstream, often confusingly</strong> - a numeric column stored as text because of a few stray non-numeric entries (e.g. "N/A" mixed into a price column) will make an entire column non-numeric in pandas, silently disabling arithmetic operations, scaling, and most models until the type issue is found and fixed.</li>
</ul>
<h3>Real-World Example</h3>
A retail company's <strong>sales dataset</strong> combines records from multiple regional systems (online store, in-store POS, and a legacy warehouse system) into one table before training a sales-forecasting model. The <code>state</code> column contains "NY", "New York", and "new york" as three separate strings across the three systems; the <code>age</code> column (customer age at purchase) contains a data-entry typo of <code>-5</code> and a placeholder value of <code>300</code> used by one legacy system to mean "unknown"; and the <code>price</code> column is stored as text in the online-store export because a handful of rows contain "N/A" for out-of-stock items, forcing pandas to read the entire column as strings. Without cleaning, a groupby aggregation like "average sales per state" silently underestimates New York's true volume by splitting it across three separate category strings, and any attempt to compute <code>price.mean()</code> fails outright until the column's type is fixed.`,
            codeExamples: [
                `# The cost of NOT cleaning: a groupby aggregate silently split across duplicate categories
import pandas as pd

df = pd.DataFrame({
    "state": ["NY", "New York", "new york", "CA", "CA"],
    "sales": [500, 700, 300, 400, 600],
})

# WITHOUT cleaning: three "New York" variants are treated as separate groups
print("Uncleaned groupby:\\n", df.groupby("state")["sales"].sum())

# WITH cleaning: normalize first, then aggregate
df["state_clean"] = df["state"].str.strip().str.lower().replace({"ny": "new york", "new york": "new york"})
print("\\nCleaned groupby:\\n", df.groupby("state_clean")["sales"].sum())
# OUTPUT:
# Uncleaned groupby:
#  state
# CA          1000
# NY           500
# New York     700
# new york     300
# Name: sales, dtype: int64
#
# Cleaned groupby:
#  state_clean
# california  ...   <- not shown here since CA wasn't remapped in this snippet, kept as CA
# new york     1500
# Name: sales, dtype: int64`
            ],
            codeExplanations: [
                `Before cleaning, <code>groupby("state").sum()</code> reports New York's total sales as three separate, much smaller numbers (500, 700, 300) because pandas treats "NY", "New York", and "new york" as three distinct string values - anyone reading this table would badly underestimate New York's true importance as a market. After normalizing case, whitespace, and known abbreviations into one canonical <code>state_clean</code> value, the same aggregation correctly reports New York's combined total as 1500 - the real business signal that was fragmented by inconsistent formatting is fully recovered simply by cleaning the category values before aggregating, with no change to the underlying data itself.`
            ]
        },
        {
            content: `<h3>Type Mismatches: When a Numeric Column Isn't Numeric</h3>
A common and confusing cleaning problem is a column that SHOULD be numeric but got stored as text because a small number of rows contain non-numeric placeholders.
<ul>
<li>Pandas infers a column's dtype from ALL its values - if even one row contains "N/A", "unknown", or a stray comma-formatted number like "1,200", the entire column is read as an <code>object</code> (string) dtype, silently disabling arithmetic, comparisons, and most preprocessing functions on the WHOLE column, not just the bad rows.</li>
<li>The fix is to explicitly coerce with <code>pd.to_numeric(..., errors='coerce')</code>, which converts convertible values to numbers and turns unconvertible ones into <code>NaN</code> - making the bad rows visible and handleable (feeding directly into <code>Missing Value Handling</code>) instead of silently blocking the whole column.</li>
</ul>
<h3>The Risk of Cleaning Too Aggressively</h3>
Cleaning is not simply "delete or fix everything that looks wrong" - overzealous cleaning can destroy real signal along with the noise.
<ul>
<li><strong>Deleting every row with any flagged issue can introduce bias</strong> - if rows with unusual-but-real values (e.g. genuinely very high earners) are dropped alongside true errors, the cleaned dataset becomes less representative of the real population, not more accurate.</li>
<li><strong>"Fixing" values based on wrong assumptions can fabricate false signal</strong> - e.g. assuming every negative age is a sign-flip typo and taking its absolute value would silently convert a genuinely corrupted row into a plausible-looking but entirely fake data point.</li>
<li>The safer default is to <strong>flag and investigate</strong> suspicious values before deciding to drop, correct, or keep them - the correct action depends on WHY the value looks wrong, which requires domain context, not just a blanket rule.</li>
</ul>`,
            codeExamples: [
                `# Fixing a type mismatch and comparing aggressive vs cautious cleaning of invalid ages
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "price": ["120.50", "N/A", "89.99", "1,200.00", "45.00"],
    "age": [34, -5, 300, 28, 41],
})

# Type mismatch fix: coerce to numeric, turning bad entries into NaN instead of blocking the column
df["price_clean"] = pd.to_numeric(df["price"].str.replace(",", ""), errors="coerce")
print("Cleaned price column:\\n", df["price_clean"])
print("dtype before:", df["price"].dtype, " | dtype after:", df["price_clean"].dtype)

# Cautious vs aggressive age cleaning
aggressive = df[df["age"].between(0, 120)]                     # drops rows outright
cautious = df.assign(age_flag=~df["age"].between(0, 120))      # flags for review, keeps the row
print("\\nRows kept after AGGRESSIVE cleaning:", len(aggressive), "/", len(df))
print("Rows kept after CAUTIOUS flagging:  ", len(cautious), "/", len(df), "(nothing deleted yet)")
# OUTPUT:
# Cleaned price column:
# 0     120.50
# 1        NaN
# 2      89.99
# 3    1200.00
# 4      45.00
# Name: price_clean, dtype: float64
# dtype before: object  | dtype after: float64
#
# Rows kept after AGGRESSIVE cleaning: 3 / 5
# Rows kept after CAUTIOUS flagging:   5 / 5 (nothing deleted yet)`
            ],
            codeExplanations: [
                `<code>pd.to_numeric(..., errors="coerce")</code> converts every parseable string ("120.50", "1,200.00" after stripping the comma) into a proper float, and turns the unparseable "N/A" into <code>NaN</code> instead of raising an error or leaving the whole column as text - the dtype change from <code>object</code> to <code>float64</code> confirms the column is now usable for arithmetic and modeling. The aggressive approach to the age column immediately drops any row with an out-of-range value, permanently losing two rows (and any other correct information they contained, like their price); the cautious approach instead adds an <code>age_flag</code> column marking which rows look suspicious while keeping every row intact, allowing a human or a domain-specific rule to decide the right fix later rather than losing data based on a blanket assumption.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Recovers signal that inconsistent formatting would otherwise fragment</strong> - as shown, normalizing category text alone can correct an aggregate as basic as "total sales per state".</li>
<li><strong>Prevents silent statistical corruption</strong> - catching impossible values before computing means, standard deviations, or scaling parameters keeps every downstream preprocessing step (imputation, scaling, outlier detection) working from trustworthy numbers.</li>
<li><strong>Makes type mismatches visible instead of blocking, opaque</strong> - coercing to the correct dtype with explicit error handling turns a confusing "why can't I do math on this column" bug into a clear, countable set of <code>NaN</code> rows to handle deliberately.</li>
<li><strong>Improves every downstream step for free</strong> - clean categories make encoding simpler, clean numeric columns make scaling and outlier detection meaningful, and clean types make the whole pipeline run without silent type errors.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Extremely time-consuming</strong> - the widely cited 60-80% of project time spent here reflects how much manual investigation, domain knowledge, and iteration real-world cleaning requires, especially across multiple messy source systems.</li>
<li><strong>Overly aggressive cleaning can introduce new bias</strong> - blanket rules for dropping or "fixing" flagged rows risk removing genuine rare-but-real cases along with true errors, quietly skewing the dataset.</li>
<li><strong>No single automated tool catches every issue</strong> - inconsistent category spellings, domain-specific impossible values, and business-specific placeholder codes ("999 means unknown") require project-specific knowledge that generic cleaning libraries can't fully automate.</li>
<li><strong>Cleaning decisions must be applied consistently to future/production data</strong> - if the same normalization rules used at training time aren't reapplied identically to new incoming data, the model will see differently-formatted inputs than it was trained on.</li>
</ul>`,
            codeExamples: [
                `# Building a reusable cleaning function so training-time rules apply identically in production
import pandas as pd

STATE_MAP = {"ny": "new york", "new york": "new york", "ca": "california", "california": "california"}

def clean_customer_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["state"] = df["state"].str.strip().str.lower().replace(STATE_MAP)
    df["price"] = pd.to_numeric(df["price"].astype(str).str.replace(",", ""), errors="coerce")
    df["age_flag"] = ~df["age"].between(0, 120)
    return df

training_batch = pd.DataFrame({"state": ["NY", "CA"], "price": ["100", "1,500"], "age": [30, 300]})
production_batch = pd.DataFrame({"state": ["new york"], "price": ["N/A"], "age": [45]})

print(clean_customer_data(training_batch))
print(clean_customer_data(production_batch))
# OUTPUT:
#         state  price  age  age_flag
# 0    new york  100.0   30     False
# 1  california 1500.0  300      True
#
#       state  price  age  age_flag
# 0  new york    NaN   45     False`
            ],
            codeExplanations: [
                `Wrapping every cleaning rule inside one function, <code>clean_customer_data</code>, guarantees the exact same normalization, type coercion, and validity checks are applied whether the data is the original training batch or a brand-new production batch arriving later. This matters because a common real-world bug is cleaning training data by hand in a notebook and then forgetting to apply the identical rules to new data at inference time - the model would then see inconsistently formatted categories or raw invalid values it never learned to handle, silently degrading production performance in a way that would be invisible without directly comparing the training and production cleaning logic.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is data cleaning often said to take 60-80% of a real ML project's time, and what kinds of problems does it cover?</td><td>It covers a broad umbrella of issues that must be found through manual investigation and domain knowledge - inconsistent category formatting ("NY" vs "New York"), impossible values (negative or absurdly large ages), type mismatches (a numeric column stored as text because of stray non-numeric entries), and general formatting problems - and each of these typically requires iterating with real data and business context rather than a single automated fix, which is why it dominates project time compared to model training itself</td></tr>
<tr class='text-center'><td>What happens if a numeric column contains even one non-numeric value like "N/A", and how do you fix it?</td><td>Pandas infers a single dtype for the whole column, so even one non-numeric entry forces the ENTIRE column to be read as an object/string dtype, silently disabling arithmetic and most preprocessing functions on every value in that column, not just the bad one; the fix is <code>pd.to_numeric(column, errors='coerce')</code>, which converts valid entries to numbers and turns unconvertible ones into NaN, making the problem visible and ready for explicit missing-value handling</td></tr>
<tr class='text-center'><td>Why can aggressive data cleaning actually hurt a model instead of helping it?</td><td>Blanket rules for dropping or "correcting" every flagged value risk removing or distorting genuinely real, rare data points along with true errors - for example, assuming every unusually large value is a typo and deleting it could remove real outliers the business actually cares about (like a legitimate luxury purchase), making the cleaned dataset less representative of reality rather than more accurate; the safer approach is to flag suspicious values for investigation before deciding whether to drop, correct, or keep them</td></tr>
</table>`
        }
    ]
};
