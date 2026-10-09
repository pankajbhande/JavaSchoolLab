import { Topic } from '../../coreJava';

export const derivatives: Topic = {
    id: 'ml-mathematics-derivatives',
    name: 'Derivatives',
    beginner: [
        {
            content: `<h4>The Slope of a Function at a Single Point</h4>
<ul>
<li>A <strong>derivative</strong> measures the <strong>instantaneous rate of change</strong> of a function - how much the output changes for a tiny change in the input, at one specific point. Geometrically, it's the slope of the line tangent to the function's curve at that point.</li>
<li>Written <code>f'(x)</code> or <code>df/dx</code>, the derivative answers: "if I nudge <code>x</code> slightly, does <code>f(x)</code> go up, down, or stay flat, and by how much?"</li>
<li>A <strong>partial derivative</strong> <code>&part;f/&part;x</code> is the same idea applied to a function of MULTIPLE variables - it measures how <code>f</code> changes with respect to ONE variable while holding all the others fixed. This matters because every real ML model (a neural network, a regression with many features) is a function of many parameters at once, not just one.</li>
</ul>`,
            codeExamples: [
                `# Approximating a derivative numerically (finite differences) vs the exact symbolic answer
import sympy as sp

x = sp.symbols('x')
f = x ** 2 + 3 * x          # f(x) = x^2 + 3x

# Exact derivative using symbolic differentiation
f_prime_exact = sp.diff(f, x)
print("Exact derivative f'(x):", f_prime_exact)

# Numerical approximation using the finite-difference definition of a derivative:
# f'(x) ~= (f(x + h) - f(x - h)) / (2h), for a very small h
def f_numeric(val):
    return val ** 2 + 3 * val

point = 2.0
h = 1e-5
approx_slope = (f_numeric(point + h) - f_numeric(point - h)) / (2 * h)
exact_slope = f_prime_exact.subs(x, point)

print(f"Numerical approximation at x={point}: {approx_slope:.6f}")
print(f"Exact value at x={point}:           {float(exact_slope):.6f}")
# OUTPUT:
# Exact derivative f'(x): 2*x + 3
# Numerical approximation at x=2.0: 7.000000
# Exact value at x=2.0:           7.000000`
            ],
            codeExplanations: [
                `<code>sp.diff(f, x)</code> uses <strong>sympy</strong>'s symbolic math engine to compute the exact derivative of <code>f(x) = x^2 + 3x</code>, giving <code>2x + 3</code> - the same formula you'd get doing calculus by hand. The numerical approximation instead uses the raw DEFINITION of a derivative directly: nudge <code>x</code> a tiny amount <code>h</code> in each direction, see how much <code>f(x)</code> changed, and divide by the size of the nudge - this is exactly what a computer does when it can't (or doesn't need to) work out a symbolic formula. Both methods agree at <code>x=2</code>, giving a slope of 7: this match is the core intuition to build - a derivative is nothing more mysterious than "how much did the output move, divided by how much the input moved," in the limit of an infinitesimally small move.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
Every ML model that "learns" does so by adjusting numeric parameters (weights) to reduce a <strong>cost function</strong> (also called a loss function) that measures how wrong its predictions are. The derivative of that cost function with respect to a parameter is precisely what tells the training algorithm which direction to move that parameter, and by how much, to make the model less wrong.
<ul>
<li>Without derivatives, there would be no principled way to know whether increasing or decreasing a weight improves or worsens a model's predictions - you'd be reduced to blind guessing across a parameter space with potentially millions of dimensions.</li>
<li>Because real models have many parameters at once (a linear regression has a slope AND an intercept; a neural network has millions of weights), ML relies specifically on <strong>partial derivatives</strong> - one per parameter - each answering "how does the cost change if I move JUST this one weight, holding all the others fixed?"</li>
<li>The collection of all of a function's partial derivatives is called the <strong>gradient</strong>, and it is the gradient - built entirely out of derivatives - that every gradient-based training algorithm (gradient descent, Adam, SGD) uses to update parameters.</li>
</ul>
<h3>Real-World Example</h3>
Consider fitting a simple <strong>linear regression</strong> line <code>y = m*x + b</code> to predict house prices from square footage, using <strong>Mean Squared Error (MSE)</strong> as the cost function: <code>J(m, b) = mean((m*x_i + b - y_i)^2)</code>.
<ul>
<li>The partial derivative <code>&part;J/&part;m</code> tells you: if I nudge the slope <code>m</code> up slightly, does the average squared error go up or down, and how sharply? If it's positive, the slope is currently too large and should be decreased; if negative, it should be increased.</li>
<li>Likewise <code>&part;J/&part;b</code> tells you the exact same thing for the intercept <code>b</code>. Gradient descent literally does nothing more than compute both partial derivatives and nudge <code>m</code> and <code>b</code> a small step in the direction that REDUCES <code>J</code> - repeating this thousands of times is the entire "learning" process.</li>
</ul>`,
            codeExamples: [
                `# Using partial derivatives of a linear regression's MSE cost to find which direction reduces error
import sympy as sp

m, b, x_i, y_i = sp.symbols('m b x_i y_i')

# Cost for a single data point (squared error); real MSE averages this over all points
error_term = (m * x_i + b - y_i) ** 2

# Partial derivatives with respect to each parameter
dJ_dm = sp.diff(error_term, m)
dJ_db = sp.diff(error_term, b)

print("dJ/dm =", dJ_dm)
print("dJ/db =", dJ_db)

# Plug in a concrete example: house is 1500 sqft, true price $300k,
# and the model currently guesses with m=150, b=50000 (price = 150*sqft + 50000)
values = {m: 150, b: 50000, x_i: 1500, y_i: 300000}
print("Current prediction:", 150 * 1500 + 50000)
print("dJ/dm at this point:", dJ_dm.subs(values))
print("dJ/db at this point:", dJ_db.subs(values))
# OUTPUT:
# dJ/dm = 2*x_i*(b + m*x_i - y_i)
# dJ/db = 2*(b + m*x_i - y_i)
# Current prediction: 275000
# dJ/dm at this point: -75000000
# dJ/db at this point: -50000`
            ],
            codeExplanations: [
                `<code>sp.diff(error_term, m)</code> and <code>sp.diff(error_term, b)</code> compute the partial derivative of the squared-error cost with respect to the slope and intercept separately, treating the other variable as a constant each time - this is precisely what "partial" means. Plugging in concrete numbers (a 1500 sqft house truly worth $300k, with the model currently predicting only $275k) shows both partial derivatives come out <strong>negative</strong>. A negative <code>dJ/dm</code> means increasing <code>m</code> would DECREASE the cost (since gradient descent moves opposite the derivative's sign), so the training algorithm would push <code>m</code> up; the same logic applies to <code>b</code>. This is the exact mechanism, scaled up to millions of parameters, that every gradient-based ML model uses to learn from its mistakes.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Gives an exact, principled direction to improve a model</strong> - rather than randomly trying different parameter values, the derivative's sign and magnitude tell you precisely which way to move and roughly how far, turning training into a directed search instead of blind trial and error.</li>
<li><strong>Computationally cheap to evaluate</strong> - for the huge majority of functions used in ML (linear combinations, sigmoids, ReLUs, squared errors), derivatives have simple closed-form formulas that are fast to compute even when repeated millions of times during training.</li>
<li><strong>Generalizes cleanly to many parameters via partial derivatives</strong> - the same underlying idea (holding everything else fixed, how does the output change) scales from a 2-parameter linear regression to a neural network with billions of weights without needing a fundamentally different concept.</li>
<li><strong>Enables automatic differentiation</strong> - because derivatives of simple building-block functions are known in closed form, frameworks like PyTorch and TensorFlow can automatically compute the derivative of enormous, complex composed functions (entire neural networks) with no manual calculus required from the practitioner.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Requires the function to be differentiable</strong> - a derivative doesn't exist at a sharp corner or discontinuity (e.g. raw classification accuracy, which jumps in discrete steps rather than changing smoothly), which is exactly why ML uses smooth proxy losses like cross-entropy instead of optimizing accuracy directly.</li>
<li><strong>Only describes LOCAL behavior at a single point</strong> - a derivative tells you the slope right where you are, not what the function looks like far away; this is why gradient-based optimization takes many small steps rather than jumping straight to the answer, and can be misled by local bumps in the cost surface.</li>
<li><strong>Numerical (finite-difference) approximations can be imprecise</strong> - choosing too large a step size <code>h</code> gives an inaccurate slope estimate, while too small an <code>h</code> can suffer from floating-point rounding error; this is why production ML frameworks use exact symbolic/automatic differentiation rather than finite differences during actual training.</li>
<li><strong>Vanishing or exploding derivatives in deep networks</strong> - when many layers each have small (or large) local derivatives, multiplying them together across dozens of layers (as the chain rule requires) can make the resulting gradient shrink toward zero or blow up, stalling or destabilizing training.</li>
</ul>`,
            codeExamples: [
                `# Comparing numerical finite-difference derivatives at different step sizes against the exact answer
def f(x):
    return x ** 3 - 2 * x

def exact_derivative(x):
    return 3 * x ** 2 - 2   # worked out by hand: d/dx[x^3 - 2x] = 3x^2 - 2

point = 1.5
true_value = exact_derivative(point)

for h in [1.0, 0.1, 1e-5, 1e-12]:
    approx = (f(point + h) - f(point - h)) / (2 * h)
    print(f"h={h:<10} approx={approx:.8f}  error={abs(approx - true_value):.2e}")

print(f"\\nExact derivative at x={point}: {true_value}")
# OUTPUT:
# h=1.0        approx=8.75000000  error=2.50e+00
# h=0.1        approx=6.75500000  error=5.00e-02
# h=1e-05      approx=6.75000000  error=1.05e-10
# h=1e-12      approx=6.75015004  error=1.50e-04   <- floating-point rounding error creeps back in
#
# Exact derivative at x=1.5: 6.75`
            ],
            codeExplanations: [
                `This sweeps the finite-difference step size <code>h</code> across several orders of magnitude to show the tradeoff described above. With a large <code>h=1.0</code>, the approximation is far from the true derivative of 6.75 because the function's curvature changes noticeably over that wide a window. As <code>h</code> shrinks to 0.1 and then 1e-5, the approximation gets dramatically closer to the exact value, matching the intuition that a derivative is the limit of the slope as the step shrinks toward zero. But pushing <code>h</code> absurdly small (1e-12) makes the error creep back UP rather than continuing to improve, because subtracting two nearly-identical floating-point numbers (<code>f(x+h)</code> and <code>f(x-h)</code>) loses precision - this is exactly why real ML frameworks never rely on finite differences during training, and instead use exact symbolic or automatic differentiation.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does a derivative represent, in plain terms, and why does ML care about it?</td><td>A derivative is the instantaneous rate of change of a function - the slope of its tangent line at a point. In ML it tells the training algorithm exactly how a small change in a parameter (weight) affects the cost/loss function, which is the information gradient-based optimization needs to know which direction to adjust each parameter</td></tr>
<tr class='text-center'><td>What is a partial derivative, and why is it necessary for training ML models?</td><td>A partial derivative measures how a function changes with respect to ONE variable, holding all other variables fixed. It's necessary because real ML models are functions of many parameters at once (millions of weights in a neural network) - the partial derivative with respect to each individual weight tells you how to adjust that one weight specifically, and the full set of partial derivatives together forms the gradient</td></tr>
<tr class='text-center'><td>Why do ML frameworks use automatic/symbolic differentiation instead of numerically approximating derivatives with finite differences during training?</td><td>Finite-difference approximation requires choosing a step size h that trades off truncation error (h too large) against floating-point rounding error (h too small), is never perfectly exact, and requires at least two extra function evaluations per parameter - far too slow and imprecise across millions of parameters. Automatic differentiation computes exact derivative values by mechanically applying the chain rule through known building-block derivatives, and is both fast and precise enough for real training</td></tr>
</table>`
        }
    ]
};
