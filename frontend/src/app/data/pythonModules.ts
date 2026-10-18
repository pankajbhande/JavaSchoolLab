// The Python syllabus: 40 modules spanning beginner fundamentals through CPython internals.
// Most topics start as placeholders (name + a short "coming soon" body) and get real
// content filled in one at a time - the navigation and routing for the whole syllabus
// exists from day one, same shape as mlModules.ts and dsaModules.ts.
//
// The five topics written for the old two-module Python course are kept below as
// overrides with their original ids, so visited-topic progress carries over.
//
// Order follows the syllabus, except Closures comes before Decorators (decorators are
// built on closures).

import type { Topic, SubTopic } from './types';
import { withDeepDive } from './topics/python/deepdive/deepDive';
import { deepDives } from './topics/python/deepdive';
import { introductionToPython } from './topics/python/IntroductionToPython';
import { installingPython } from './topics/python/InstallingPython';
import { editorSetup } from './topics/python/EditorSetup';
import { runningPythonAndRepl } from './topics/python/RunningPythonAndRepl';
import { pipAndVirtualEnvironments } from './topics/python/PipAndVirtualEnvironments';
import { commentsAndPep8 } from './topics/python/CommentsAndPep8';
import { pythonDataTypes } from './topics/python/DataTypesAndVariables';
import { dynamicTyping } from './topics/python/DynamicTyping';
import { numericTypes } from './topics/python/NumericTypes';
import { boolAndNone } from './topics/python/BoolAndNone';
import { stringsBasics } from './topics/python/StringsBasics';
import { typeConversion } from './topics/python/TypeConversion';
import { typeAndIsinstance } from './topics/python/TypeAndIsinstance';
import { mutableVsImmutable } from './topics/python/MutableVsImmutable';
import { objectIdentity } from './topics/python/ObjectIdentity';
import { arithmeticComparisonAssignment } from './topics/python/ArithmeticComparisonAssignment';
import { logicalAndBitwise } from './topics/python/LogicalAndBitwise';
import { membershipAndIdentity } from './topics/python/MembershipAndIdentity';
import { operatorPrecedence } from './topics/python/OperatorPrecedence';
import { stringIndexingSlicing } from './topics/python/StringIndexingSlicing';
import { stringMethods } from './topics/python/StringMethods';
import { escapeSequencesAndRawStrings } from './topics/python/EscapeSequencesAndRawStrings';
import { fStringsAndFormatting } from './topics/python/FStringsAndFormatting';
import { unicodeEncodingDecoding } from './topics/python/UnicodeEncodingDecoding';
import { inputAndPrint } from './topics/python/InputAndPrint';
import { formattingOutput } from './topics/python/FormattingOutput';
import { stdinAndStdout } from './topics/python/StdinAndStdout';
import { pythonControlFlow } from './topics/python/ControlFlow';
import { ifElifElse } from './topics/python/IfElifElse';
import { nestedConditions } from './topics/python/NestedConditions';
import { forLoopsAndRange } from './topics/python/ForLoopsAndRange';
import { whileLoops } from './topics/python/WhileLoops';
import { breakContinuePass } from './topics/python/BreakContinuePass';
import { matchCase } from './topics/python/MatchCase';
import { nestedLoops } from './topics/python/NestedLoops';
import { practiceCalculator } from './topics/python/PracticeCalculator';
import { practiceNumberGuessingGame } from './topics/python/PracticeNumberGuessingGame';
import { practiceAtmSimulation } from './topics/python/PracticeAtmSimulation';
import { practiceMenuDrivenProgram } from './topics/python/PracticeMenuDrivenProgram';
import { practicePatternPrograms } from './topics/python/PracticePatternPrograms';
import { listsBasics } from './topics/python/ListsBasics';
import { addingRemovingListItems } from './topics/python/AddingRemovingListItems';
import { listMethods } from './topics/python/ListMethods';
import { copyingLists } from './topics/python/CopyingLists';
import { tuples } from './topics/python/Tuples';
import { tuplePackingUnpacking } from './topics/python/TuplePackingUnpacking';
import { sets } from './topics/python/Sets';
import { setOperations } from './topics/python/SetOperations';
import { dictionaries } from './topics/python/Dictionaries';
import { dictionaryMethods } from './topics/python/DictionaryMethods';
import { dictionaryUnpacking } from './topics/python/DictionaryUnpacking';
import { listVsTuple } from './topics/python/ListVsTuple';
import { listVsSet } from './topics/python/ListVsSet';
import { dictionaryInternals } from './topics/python/DictionaryInternals';
import { shallowVsDeepCopy } from './topics/python/ShallowVsDeepCopy';
import { pythonFunctions } from './topics/python/Functions';
import { parametersArgumentsReturn } from './topics/python/ParametersArgumentsReturn';
import { defaultKeywordPositionalArgs } from './topics/python/DefaultKeywordPositionalArgs';
import { argsKwargs } from './topics/python/ArgsKwargs';
import { scopeLocalGlobal } from './topics/python/ScopeLocalGlobal';
import { globalNonlocal } from './topics/python/GlobalNonlocal';
import { recursion } from './topics/python/Recursion';
import { lambdaFunctions } from './topics/python/LambdaFunctions';
import { higherOrderFunctions } from './topics/python/HigherOrderFunctions';
import { mapFilterReduce } from './topics/python/MapFilterReduce';
import { zipEnumerate } from './topics/python/ZipEnumerate';
import { anyAllSorted } from './topics/python/AnyAllSorted';
import { listComprehensions } from './topics/python/ListComprehensions';
import { conditionalComprehensions } from './topics/python/ConditionalComprehensions';
import { dictComprehensions } from './topics/python/DictComprehensions';
import { setComprehensions } from './topics/python/SetComprehensions';
import { nestedComprehensions } from './topics/python/NestedComprehensions';
import { whatAreExceptions } from './topics/python/WhatAreExceptions';
import { tryExcept } from './topics/python/TryExcept';
import { elseFinally } from './topics/python/ElseFinally';
import { handlingMultipleExceptions } from './topics/python/HandlingMultipleExceptions';
import { raiseStatement } from './topics/python/RaiseStatement';
import { customExceptions } from './topics/python/CustomExceptions';
import { exceptionHierarchy } from './topics/python/ExceptionHierarchy';
import { exceptionChaining } from './topics/python/ExceptionChaining';
import { openingFiles } from './topics/python/OpeningFiles';
import { readingWritingAppending } from './topics/python/ReadingWritingAppending';
import { withStatement } from './topics/python/WithStatement';
import { textVsBinaryFiles } from './topics/python/TextVsBinaryFiles';
import { csvFiles } from './topics/python/CsvFiles';
import { jsonFiles } from './topics/python/JsonFiles';
import { pickleFiles } from './topics/python/PickleFiles';
import { importStatements } from './topics/python/ImportStatements';
import { importAliases } from './topics/python/ImportAliases';
import { nameMain } from './topics/python/NameMain';
import { creatingModules } from './topics/python/CreatingModules';
import { creatingPackages } from './topics/python/CreatingPackages';
import { absoluteRelativeImports } from './topics/python/AbsoluteRelativeImports';
import { sysPath } from './topics/python/SysPath';
import { osSys } from './topics/python/OsSys';
import { mathRandom } from './topics/python/MathRandom';
import { datetimeTime } from './topics/python/DatetimeTime';
import { jsonCsvModules } from './topics/python/JsonCsvModules';
import { reModule } from './topics/python/ReModule';
import { collectionsModule } from './topics/python/CollectionsModule';
import { itertoolsFunctools } from './topics/python/ItertoolsFunctools';
import { pathlibModule } from './topics/python/PathlibModule';
import { subprocessModule } from './topics/python/SubprocessModule';
import { whatIsAClosure } from './topics/python/WhatIsAClosure';
import { lexicalScope } from './topics/python/LexicalScope';
import { freeVariables } from './topics/python/FreeVariables';
import { nonlocalInClosures } from './topics/python/NonlocalInClosures';
import { closureLateBinding } from './topics/python/ClosureLateBinding';
import { contextUsingWith } from './topics/python/ContextUsingWith';
import { contextEnterExit } from './topics/python/ContextEnterExit';
import { contextManagerClass } from './topics/python/ContextManagerClass';
import { contextmanagerDecorator } from './topics/python/ContextmanagerDecorator';
import { oopInPython } from './topics/python/OopInPython';
import { attributesMethods } from './topics/python/AttributesMethods';
import { constructorsSelf } from './topics/python/ConstructorsSelf';
import { encapsulation } from './topics/python/Encapsulation';
import { inheritance } from './topics/python/Inheritance';
import { polymorphism } from './topics/python/Polymorphism';
import { abstraction } from './topics/python/Abstraction';
import { instanceVsClassVariables } from './topics/python/InstanceVsClassVariables';
import { instanceClassStaticMethods } from './topics/python/InstanceClassStaticMethods';
import { propertyGettersSetters } from './topics/python/PropertyGettersSetters';
import { methodOverriding } from './topics/python/MethodOverriding';
import { multipleInheritanceMro } from './topics/python/MultipleInheritanceMro';
import { superFunction } from './topics/python/SuperFunction';
import { abstractClassesAbc } from './topics/python/AbstractClassesAbc';
import { interfacesWithProtocols } from './topics/python/InterfacesWithProtocols';
import { dunderMethods } from './topics/python/DunderMethods';
import { initStrRepr } from './topics/python/InitStrRepr';
import { lenGetitemSetitem } from './topics/python/LenGetitemSetitem';
import { containsMethod } from './topics/python/ContainsMethod';
import { iterNext } from './topics/python/IterNext';
import { eqLt } from './topics/python/EqLt';
import { operatorOverloading } from './topics/python/OperatorOverloading';
import { callMethod } from './topics/python/CallMethod';
import { pythonObjectModel } from './topics/python/PythonObjectModel';
import { dataModelProtocols } from './topics/python/DataModelProtocols';
import { iterablesVsIterators } from './topics/python/IterablesVsIterators';
import { iteratorsIterNext } from './topics/python/IteratorsIterNext';
import { generatorsYield } from './topics/python/GeneratorsYield';
import { generatorExpressions } from './topics/python/GeneratorExpressions';
import { lazyEvaluation } from './topics/python/LazyEvaluation';
import { yieldFrom } from './topics/python/YieldFrom';
import { generatorPipelines } from './topics/python/GeneratorPipelines';
import { functionsAsObjects } from './topics/python/DecoratorsFunctionsAsObjects';
import { nestedFunctions } from './topics/python/DecoratorsNestedFunctions';
import { writingADecorator } from './topics/python/WritingADecorator';
import { decoratorSyntax } from './topics/python/DecoratorSyntax';
import { decoratorsWithArguments } from './topics/python/DecoratorsWithArguments';
import { functoolsWraps } from './topics/python/FunctoolsWraps';
import { typeHintsAnnotations } from './topics/python/TypeHintsAnnotations';
import { typeHintsCollections } from './topics/python/TypeHintsCollections';
import { typeHintsOptionalUnion } from './topics/python/TypeHintsOptionalUnion';
import { typeHintsLiteralFinal } from './topics/python/TypeHintsLiteralFinal';
import { typeHintsTypedDict } from './topics/python/TypeHintsTypedDict';
import { typeHintsCallable } from './topics/python/TypeHintsCallable';
import { typeHintsTypeVarGenerics } from './topics/python/TypeHintsTypeVarGenerics';
import { typeHintsProtocol } from './topics/python/TypeHintsProtocol';
import { typeHintsTypeAlias } from './topics/python/TypeHintsTypeAlias';
import { regexMatchVsSearch } from './topics/python/RegexMatchVsSearch';
import { regexFindallSub } from './topics/python/RegexFindallSub';
import { regexCharacterClasses } from './topics/python/RegexCharacterClasses';
import { regexQuantifiers } from './topics/python/RegexQuantifiers';
import { regexGroups } from './topics/python/RegexGroups';
import { regexLookaround } from './topics/python/RegexLookaround';
import { regexProjectEmailValidator } from './topics/python/RegexProjectEmailValidator';
import { regexProjectPhoneValidator } from './topics/python/RegexProjectPhoneValidator';
import { regexProjectPasswordValidator } from './topics/python/RegexProjectPasswordValidator';
import { regexProjectLogParser } from './topics/python/RegexProjectLogParser';
import { unittestCasesAssertions } from './topics/python/UnittestCasesAssertions';
import { unittestSetupTeardown } from './topics/python/UnittestSetupTeardown';
import { unittestMock } from './topics/python/UnittestMock';
import { pytestBasics } from './topics/python/PytestBasics';
import { pytestFixtures } from './topics/python/PytestFixtures';
import { pytestParametrization } from './topics/python/PytestParametrization';
import { pytestMarksPlugins } from './topics/python/PytestMarksPlugins';
import { unitVsIntegrationTesting } from './topics/python/UnitVsIntegrationTesting';
import { testDrivenDevelopment } from './topics/python/TestDrivenDevelopment';
import { codeCoverage } from './topics/python/CodeCoverage';
import { printDebugging } from './topics/python/PrintDebugging';
import { readingStackTraces } from './topics/python/ReadingStackTraces';
import { pdbBreakpoints } from './topics/python/PdbBreakpoints';
import { loggingBasicsLevels } from './topics/python/LoggingBasicsLevels';
import { loggingHandlersFormatters } from './topics/python/LoggingHandlersFormatters';
import { loggingRotatingLogs } from './topics/python/LoggingRotatingLogs';
import { memoryStackVsHeap } from './topics/python/MemoryStackVsHeap';
import { memoryReferencesObjects } from './topics/python/MemoryReferencesObjects';
import { memoryReferenceCounting } from './topics/python/MemoryReferenceCounting';
import { memoryGarbageCollection } from './topics/python/MemoryGarbageCollection';
import { memoryCyclicReferences } from './topics/python/MemoryCyclicReferences';
import { memoryWeakref } from './topics/python/MemoryWeakref';
import { memoryAllocation } from './topics/python/MemoryAllocation';
import { memoryObjectCachingInterning } from './topics/python/MemoryObjectCachingInterning';
import { memoryWhyReuseObject } from './topics/python/MemoryWhyReuseObject';
import { internalsCPythonInterpreter } from './topics/python/InternalsCPythonInterpreter';
import { internalsCompilation } from './topics/python/InternalsCompilation';
import { internalsPycFiles } from './topics/python/InternalsPycFiles';
import { internalsBytecodeDis } from './topics/python/InternalsBytecodeDis';
import { internalsAstModule } from './topics/python/InternalsAstModule';
import { internalsExecutionFrames } from './topics/python/InternalsExecutionFrames';
import { internalsCodeObjects } from './topics/python/InternalsCodeObjects';
import { internalsNamespacesSymbolTables } from './topics/python/InternalsNamespacesSymbolTables';
import { gilWhatIs } from './topics/python/GilWhatIs';
import { gilWhyExists } from './topics/python/GilWhyExists';
import { gilCpuVsIoBound } from './topics/python/GilCpuVsIoBound';
import { gilThreadsVsProcesses } from './topics/python/GilThreadsVsProcesses';
import { gilLimitations } from './topics/python/GilLimitations';
import { gilFreeThreaded } from './topics/python/GilFreeThreaded';
import { threadingCreatingThreads } from './topics/python/ThreadingCreatingThreads';
import { threadingLockRLock } from './topics/python/ThreadingLockRLock';
import { threadingSemaphore } from './topics/python/ThreadingSemaphore';
import { threadingEventCondition } from './topics/python/ThreadingEventCondition';
import { threadingRaceConditions } from './topics/python/ThreadingRaceConditions';
import { threadingDeadlocks } from './topics/python/ThreadingDeadlocks';
import { threadingThreadPools } from './topics/python/ThreadingThreadPools';

const slug = (s: string) =>
    s.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

function placeholder(categoryId: string, name: string): Topic {
    return {
        id: `${categoryId}-${slug(name)}`,
        name,
        beginner: [
            {
                content: `<h4>${name}</h4>
Content for this topic is coming soon.`
            }
        ]
    };
}

/** Builds a module from topic names, swapping in a pre-written Topic wherever `overrides` names one. */
function buildModule(id: string, name: string, topicNames: string[], overrides: Record<string, Topic> = {}): SubTopic {
    return {
        id,
        name,
        topics: topicNames.map(n => overrides[n] ?? placeholder(id, n))
    };
}

const baseModules: SubTopic[] = [
    // ---------------------------------------------------------------- Beginner
    buildModule('python-basics', 'Python Fundamentals', [
        'Introduction to Python',
        'Installing Python & the Interpreter',
        'VS Code & PyCharm Setup',
        'Running .py Files & the REPL',
        'pip & Virtual Environments',
        'Comments & PEP 8',
        'Data Types & Variables',
        'Dynamic Typing',
        'Numeric Types: int, float & complex',
        'bool & None',
        'Strings (str) Basics',
        'Type Conversion',
        'type() & isinstance()',
        'Mutable vs Immutable Objects',
        'Object Identity & id()',
        'Arithmetic, Comparison & Assignment Operators',
        'Logical & Bitwise Operators',
        'Membership & Identity Operators',
        'Operator Precedence',
        'String Indexing & Slicing',
        'String Methods',
        'Escape Sequences & Raw Strings',
        'f-strings & String Formatting',
        'Unicode, Encoding & Decoding',
        'input() & print()',
        'Formatting Output',
        'sys.stdin & sys.stdout'
    ], {
        'Introduction to Python': introductionToPython,
        'Installing Python & the Interpreter': installingPython,
        'VS Code & PyCharm Setup': editorSetup,
        'Running .py Files & the REPL': runningPythonAndRepl,
        'pip & Virtual Environments': pipAndVirtualEnvironments,
        'Comments & PEP 8': commentsAndPep8,
        'Data Types & Variables': pythonDataTypes,
        'Dynamic Typing': dynamicTyping,
        'Numeric Types: int, float & complex': numericTypes,
        'bool & None': boolAndNone,
        'Strings (str) Basics': stringsBasics,
        'Type Conversion': typeConversion,
        'type() & isinstance()': typeAndIsinstance,
        'Mutable vs Immutable Objects': mutableVsImmutable,
        'Object Identity & id()': objectIdentity,
        'Arithmetic, Comparison & Assignment Operators': arithmeticComparisonAssignment,
        'Logical & Bitwise Operators': logicalAndBitwise,
        'Membership & Identity Operators': membershipAndIdentity,
        'Operator Precedence': operatorPrecedence,
        'String Indexing & Slicing': stringIndexingSlicing,
        'String Methods': stringMethods,
        'Escape Sequences & Raw Strings': escapeSequencesAndRawStrings,
        'f-strings & String Formatting': fStringsAndFormatting,
        'Unicode, Encoding & Decoding': unicodeEncodingDecoding,
        'input() & print()': inputAndPrint,
        'Formatting Output': formattingOutput,
        'sys.stdin & sys.stdout': stdinAndStdout
    }),

    buildModule('python-control-flow', 'Control Flow', [
        'Control Flow',
        'if, elif & else',
        'Nested Conditions',
        'for Loops & range()',
        'while Loops',
        'break, continue & pass',
        'match/case',
        'Nested Loops',
        'Practice: Calculator',
        'Practice: Number Guessing Game',
        'Practice: ATM Simulation',
        'Practice: Menu-Driven Program',
        'Practice: Pattern Programs'
    ], {
        'Control Flow': pythonControlFlow,
        'if, elif & else': ifElifElse,
        'Nested Conditions': nestedConditions,
        'for Loops & range()': forLoopsAndRange,
        'while Loops': whileLoops,
        'break, continue & pass': breakContinuePass,
        'match/case': matchCase,
        'Nested Loops': nestedLoops,
        'Practice: Calculator': practiceCalculator,
        'Practice: Number Guessing Game': practiceNumberGuessingGame,
        'Practice: ATM Simulation': practiceAtmSimulation,
        'Practice: Menu-Driven Program': practiceMenuDrivenProgram,
        'Practice: Pattern Programs': practicePatternPrograms
    }),

    buildModule('python-collections', 'Python Collections', [
        'Lists: Creating, Indexing & Slicing',
        'Adding & Removing List Items',
        'List Methods: sort(), reverse() & More',
        'Copying Lists',
        'Tuples',
        'Tuple Packing & Unpacking',
        'Sets',
        'Set Operations',
        'Dictionaries',
        'Dictionary Methods',
        'Dictionary Unpacking',
        'List vs Tuple',
        'List vs Set',
        'Dictionary Internals',
        'Shallow Copy vs Deep Copy'
    ], {
        'Lists: Creating, Indexing & Slicing': listsBasics,
        'Adding & Removing List Items': addingRemovingListItems,
        'List Methods: sort(), reverse() & More': listMethods,
        'Copying Lists': copyingLists,
        'Tuples': tuples,
        'Tuple Packing & Unpacking': tuplePackingUnpacking,
        'Sets': sets,
        'Set Operations': setOperations,
        'Dictionaries': dictionaries,
        'Dictionary Methods': dictionaryMethods,
        'Dictionary Unpacking': dictionaryUnpacking,
        'List vs Tuple': listVsTuple,
        'List vs Set': listVsSet,
        'Dictionary Internals': dictionaryInternals,
        'Shallow Copy vs Deep Copy': shallowVsDeepCopy
    }),

    buildModule('python-functions', 'Functions', [
        'Functions',
        'Parameters, Arguments & Return Values',
        'Default, Keyword & Positional Arguments',
        '*args & **kwargs',
        'Scope: Local & Global Variables',
        'global & nonlocal',
        'Recursion',
        'Lambda Functions',
        'Higher-Order Functions',
        'map(), filter() & reduce()',
        'zip() & enumerate()',
        'any(), all() & sorted()'
    ], {
        'Functions': pythonFunctions,
        'Parameters, Arguments & Return Values': parametersArgumentsReturn,
        'Default, Keyword & Positional Arguments': defaultKeywordPositionalArgs,
        '*args & **kwargs': argsKwargs,
        'Scope: Local & Global Variables': scopeLocalGlobal,
        'global & nonlocal': globalNonlocal,
        'Recursion': recursion,
        'Lambda Functions': lambdaFunctions,
        'Higher-Order Functions': higherOrderFunctions,
        'map(), filter() & reduce()': mapFilterReduce,
        'zip() & enumerate()': zipEnumerate,
        'any(), all() & sorted()': anyAllSorted
    }),

    buildModule('python-comprehensions', 'Comprehensions', [
        'List Comprehensions',
        'Conditional Comprehensions',
        'Dictionary Comprehensions',
        'Set Comprehensions',
        'Nested Comprehensions'
    ], {
        'List Comprehensions': listComprehensions,
        'Conditional Comprehensions': conditionalComprehensions,
        'Dictionary Comprehensions': dictComprehensions,
        'Set Comprehensions': setComprehensions,
        'Nested Comprehensions': nestedComprehensions
    }),

    buildModule('python-exceptions', 'Exception Handling', [
        'What are Exceptions?',
        'try & except',
        'else & finally',
        'Handling Multiple Exceptions',
        'raise',
        'Custom Exceptions',
        'Exception Hierarchy',
        'Exception Chaining'
    ], {
        'What are Exceptions?': whatAreExceptions,
        'try & except': tryExcept,
        'else & finally': elseFinally,
        'Handling Multiple Exceptions': handlingMultipleExceptions,
        'raise': raiseStatement,
        'Custom Exceptions': customExceptions,
        'Exception Hierarchy': exceptionHierarchy,
        'Exception Chaining': exceptionChaining
    }),

    buildModule('python-file-handling', 'File Handling', [
        'Opening Files',
        'Reading, Writing & Appending',
        'The with Statement',
        'Text vs Binary Files',
        'CSV Files',
        'JSON Files',
        'Pickle'
    ], {
        'Opening Files': openingFiles,
        'Reading, Writing & Appending': readingWritingAppending,
        'The with Statement': withStatement,
        'Text vs Binary Files': textVsBinaryFiles,
        'CSV Files': csvFiles,
        'JSON Files': jsonFiles,
        'Pickle': pickleFiles
    }),

    buildModule('python-modules-packages', 'Modules & Packages', [
        'import & from ... import',
        'Import Aliases',
        '__name__ & __main__',
        'Creating Modules',
        'Creating Packages & __init__.py',
        'Absolute vs Relative Imports',
        'sys.path',
        'os & sys',
        'math & random',
        'datetime & time',
        'json & csv Modules',
        're Module',
        'collections Module',
        'itertools & functools',
        'pathlib',
        'subprocess'
    ], {
        'import & from ... import': importStatements,
        'Import Aliases': importAliases,
        '__name__ & __main__': nameMain,
        'Creating Modules': creatingModules,
        'Creating Packages & __init__.py': creatingPackages,
        'Absolute vs Relative Imports': absoluteRelativeImports,
        'sys.path': sysPath,
        'os & sys': osSys,
        'math & random': mathRandom,
        'datetime & time': datetimeTime,
        'json & csv Modules': jsonCsvModules,
        're Module': reModule,
        'collections Module': collectionsModule,
        'itertools & functools': itertoolsFunctools,
        'pathlib': pathlibModule,
        'subprocess': subprocessModule
    }),

    // ------------------------------------------------------------ Intermediate
    buildModule('python-oop', 'Object-Oriented Programming', [
        'Object-Oriented Programming in Python',
        'Attributes & Methods',
        'Constructors & self',
        'Encapsulation',
        'Inheritance',
        'Polymorphism',
        'Abstraction',
        'Instance vs Class Variables',
        'Instance, Class & Static Methods',
        '@property, Getters & Setters',
        'Method Overriding',
        'Multiple Inheritance & MRO',
        'super()',
        'Abstract Classes & ABC',
        'Interfaces with Protocols'
    ], {
        'Object-Oriented Programming in Python': oopInPython,
        'Attributes & Methods': attributesMethods,
        'Constructors & self': constructorsSelf,
        'Encapsulation': encapsulation,
        'Inheritance': inheritance,
        'Polymorphism': polymorphism,
        'Abstraction': abstraction,
        'Instance vs Class Variables': instanceVsClassVariables,
        'Instance, Class & Static Methods': instanceClassStaticMethods,
        '@property, Getters & Setters': propertyGettersSetters,
        'Method Overriding': methodOverriding,
        'Multiple Inheritance & MRO': multipleInheritanceMro,
        'super()': superFunction,
        'Abstract Classes & ABC': abstractClassesAbc,
        'Interfaces with Protocols': interfacesWithProtocols
    }),

    buildModule('python-data-model', 'Python Data Model', [
        'Dunder Methods',
        '__init__, __str__ & __repr__',
        '__len__, __getitem__ & __setitem__',
        '__contains__',
        '__iter__ & __next__',
        '__eq__ & __lt__',
        'Operator Overloading & __add__',
        '__call__',
        'The Python Object Model',
        'Protocols'
    ], {
        'Dunder Methods': dunderMethods,
        '__init__, __str__ & __repr__': initStrRepr,
        '__len__, __getitem__ & __setitem__': lenGetitemSetitem,
        '__contains__': containsMethod,
        '__iter__ & __next__': iterNext,
        '__eq__ & __lt__': eqLt,
        'Operator Overloading & __add__': operatorOverloading,
        '__call__': callMethod,
        'The Python Object Model': pythonObjectModel,
        'Protocols': dataModelProtocols
    }),

    buildModule('python-iterators-generators', 'Iterators & Generators', [
        'Iterables vs Iterators',
        'iter() & next()',
        'Generators & yield',
        'Generator Expressions',
        'Lazy Evaluation',
        'yield from',
        'Generator Pipelines'
    ], {
        'Iterables vs Iterators': iterablesVsIterators,
        'iter() & next()': iteratorsIterNext,
        'Generators & yield': generatorsYield,
        'Generator Expressions': generatorExpressions,
        'Lazy Evaluation': lazyEvaluation,
        'yield from': yieldFrom,
        'Generator Pipelines': generatorPipelines
    }),

    buildModule('python-closures', 'Closures', [
        'What is a Closure?',
        'Lexical Scope',
        'Free Variables',
        'nonlocal in Closures',
        'Closure Behavior & Late Binding'
    ], {
        'What is a Closure?': whatIsAClosure,
        'Lexical Scope': lexicalScope,
        'Free Variables': freeVariables,
        'nonlocal in Closures': nonlocalInClosures,
        'Closure Behavior & Late Binding': closureLateBinding
    }),

    buildModule('python-decorators', 'Decorators', [
        'Functions as Objects',
        'Nested Functions',
        'Writing a Decorator',
        'The @decorator Syntax',
        'Decorators with Arguments',
        'functools.wraps'
    ], {
        'Functions as Objects': functionsAsObjects,
        'Nested Functions': nestedFunctions,
        'Writing a Decorator': writingADecorator,
        'The @decorator Syntax': decoratorSyntax,
        'Decorators with Arguments': decoratorsWithArguments,
        'functools.wraps': functoolsWraps
    }),

    buildModule('python-context-managers', 'Context Managers', [
        'Using the with Statement',
        '__enter__ & __exit__',
        'Writing a Context Manager Class',
        '@contextmanager'
    ], {
        'Using the with Statement': contextUsingWith,
        '__enter__ & __exit__': contextEnterExit,
        'Writing a Context Manager Class': contextManagerClass,
        '@contextmanager': contextmanagerDecorator
    }),

    buildModule('python-regex', 'Regular Expressions', [
        're.match() vs re.search()',
        're.findall() & re.sub()',
        'Character Classes',
        'Quantifiers',
        'Groups & Named Groups',
        'Lookahead & Lookbehind',
        'Project: Email Validator',
        'Project: Phone Validator',
        'Project: Password Validator',
        'Project: Log Parser'
    ], {
        're.match() vs re.search()': regexMatchVsSearch,
        're.findall() & re.sub()': regexFindallSub,
        'Character Classes': regexCharacterClasses,
        'Quantifiers': regexQuantifiers,
        'Groups & Named Groups': regexGroups,
        'Lookahead & Lookbehind': regexLookaround,
        'Project: Email Validator': regexProjectEmailValidator,
        'Project: Phone Validator': regexProjectPhoneValidator,
        'Project: Password Validator': regexProjectPasswordValidator,
        'Project: Log Parser': regexProjectLogParser
    }),

    buildModule('python-type-hints', 'Type Hints', [
        'Variable & Function Annotations',
        'Collection Types: list, dict & tuple',
        'Optional & Union',
        'Literal & Final',
        'TypedDict',
        'Callable',
        'TypeVar & Generics',
        'Protocol',
        'TypeAlias'
    ], {
        'Variable & Function Annotations': typeHintsAnnotations,
        'Collection Types: list, dict & tuple': typeHintsCollections,
        'Optional & Union': typeHintsOptionalUnion,
        'Literal & Final': typeHintsLiteralFinal,
        'TypedDict': typeHintsTypedDict,
        'Callable': typeHintsCallable,
        'TypeVar & Generics': typeHintsTypeVarGenerics,
        'Protocol': typeHintsProtocol,
        'TypeAlias': typeHintsTypeAlias
    }),

    buildModule('python-testing', 'Testing', [
        'unittest: Test Cases & Assertions',
        'unittest: Setup & Teardown',
        'Mocking with unittest.mock',
        'pytest Basics',
        'pytest Fixtures',
        'pytest Parametrization',
        'pytest Marks & Plugins',
        'Unit vs Integration Testing',
        'Test-Driven Development',
        'Code Coverage'
    ], {
        'unittest: Test Cases & Assertions': unittestCasesAssertions,
        'unittest: Setup & Teardown': unittestSetupTeardown,
        'Mocking with unittest.mock': unittestMock,
        'pytest Basics': pytestBasics,
        'pytest Fixtures': pytestFixtures,
        'pytest Parametrization': pytestParametrization,
        'pytest Marks & Plugins': pytestMarksPlugins,
        'Unit vs Integration Testing': unitVsIntegrationTesting,
        'Test-Driven Development': testDrivenDevelopment,
        'Code Coverage': codeCoverage
    }),

    buildModule('python-debugging', 'Debugging & Logging', [
        'print() Debugging',
        'Reading Stack Traces',
        'pdb & Breakpoints',
        'logging Basics & Log Levels',
        'Handlers & Formatters',
        'Rotating Logs'
    ], {
        'print() Debugging': printDebugging,
        'Reading Stack Traces': readingStackTraces,
        'pdb & Breakpoints': pdbBreakpoints,
        'logging Basics & Log Levels': loggingBasicsLevels,
        'Handlers & Formatters': loggingHandlersFormatters,
        'Rotating Logs': loggingRotatingLogs
    }),

    // ------------------------------------------------------------------ Expert
    buildModule('python-memory', 'Memory Management', [
        'Stack vs Heap in Python',
        'References & Objects',
        'Reference Counting',
        'Garbage Collection & the gc Module',
        'Cyclic References',
        'weakref',
        'Memory Allocation',
        'Object Caching & Interning',
        'Why Does Python Reuse the Same Object?'
    ], {
        'Stack vs Heap in Python': memoryStackVsHeap,
        'References & Objects': memoryReferencesObjects,
        'Reference Counting': memoryReferenceCounting,
        'Garbage Collection & the gc Module': memoryGarbageCollection,
        'Cyclic References': memoryCyclicReferences,
        'weakref': memoryWeakref,
        'Memory Allocation': memoryAllocation,
        'Object Caching & Interning': memoryObjectCachingInterning,
        'Why Does Python Reuse the Same Object?': memoryWhyReuseObject
    }),

    buildModule('python-internals', 'Python Internals', [
        'CPython & the Interpreter',
        'Compilation: Source to Bytecode',
        '.pyc Files & __pycache__',
        'Python Bytecode & the dis Module',
        'AST & the ast Module',
        'Execution Model & Frames',
        'Code Objects',
        'Namespaces & Symbol Tables'
    ], {
        'CPython & the Interpreter': internalsCPythonInterpreter,
        'Compilation: Source to Bytecode': internalsCompilation,
        '.pyc Files & __pycache__': internalsPycFiles,
        'Python Bytecode & the dis Module': internalsBytecodeDis,
        'AST & the ast Module': internalsAstModule,
        'Execution Model & Frames': internalsExecutionFrames,
        'Code Objects': internalsCodeObjects,
        'Namespaces & Symbol Tables': internalsNamespacesSymbolTables
    }),

    buildModule('python-gil', 'The GIL', [
        'What is the Global Interpreter Lock?',
        'Why the GIL Exists',
        'CPU-bound vs I/O-bound Tasks',
        'Threads vs Processes',
        'GIL Limitations',
        'Free-Threaded Python'
    ], {
        'What is the Global Interpreter Lock?': gilWhatIs,
        'Why the GIL Exists': gilWhyExists,
        'CPU-bound vs I/O-bound Tasks': gilCpuVsIoBound,
        'Threads vs Processes': gilThreadsVsProcesses,
        'GIL Limitations': gilLimitations,
        'Free-Threaded Python': gilFreeThreaded
    }),

    buildModule('python-multithreading', 'Multithreading', [
        'Creating Threads',
        'Lock & RLock',
        'Semaphore',
        'Event & Condition',
        'Race Conditions',
        'Deadlocks',
        'Thread Pools'
    ], {
        'Creating Threads': threadingCreatingThreads,
        'Lock & RLock': threadingLockRLock,
        'Semaphore': threadingSemaphore,
        'Event & Condition': threadingEventCondition,
        'Race Conditions': threadingRaceConditions,
        'Deadlocks': threadingDeadlocks,
        'Thread Pools': threadingThreadPools
    }),

    buildModule('python-multiprocessing', 'Multiprocessing', [
        'Creating Processes',
        'Process Pools',
        'IPC: Queue & Pipe',
        'Shared Memory',
        'CPU-bound Workloads'
    ]),

    buildModule('python-async', 'Async Python', [
        'async & await',
        'The Event Loop',
        'Coroutines',
        'Tasks & Futures',
        'asyncio.gather()',
        'Async Generators',
        'Async Context Managers',
        'Cancellation & Timeouts',
        'asyncio Semaphores'
    ]),

    // ------------------------------------------------------------ Professional
    buildModule('python-networking', 'Networking', [
        'HTTP Fundamentals',
        'TCP/IP Basics',
        'Sockets & the socket Module',
        'HTTP Clients with requests',
        'httpx & aiohttp',
        'Consuming REST APIs',
        'WebSockets'
    ]),

    buildModule('python-api-development', 'API Development', [
        'Flask: Routes, Request & Response',
        'Flask: Middleware & Blueprints',
        'FastAPI: Routes & Pydantic',
        'FastAPI: Dependency Injection',
        'FastAPI: Authentication',
        'FastAPI: Async Endpoints & Background Tasks',
        'FastAPI: OpenAPI Docs',
        'Django: Models, Views & Templates',
        'Django ORM',
        'Django: Middleware & Authentication',
        'Django REST APIs'
    ]),

    buildModule('python-databases', 'Databases', [
        'SQL: SELECT, INSERT, UPDATE & DELETE',
        'SQL JOINs',
        'GROUP BY & HAVING',
        'Subqueries & CTEs',
        'Window Functions',
        'Indexes',
        'Transactions',
        'sqlite3',
        'SQLAlchemy ORM',
        'SQLModel',
        'Connection Pooling',
        'Migrations',
        'PostgreSQL & MySQL',
        'Redis',
        'MongoDB'
    ]),

    buildModule('python-dsa', 'Data Structures & Algorithms', [
        'Big-O Complexity',
        'Arrays & Strings',
        'Linked Lists',
        'Stacks',
        'Queues & Deques',
        'Hash Tables & Sets',
        'Trees & Binary Trees',
        'Binary Search Trees',
        'Heaps',
        'Tries',
        'Graphs',
        'Sorting',
        'Searching & Binary Search',
        'Two Pointers',
        'Sliding Window',
        'Recursion & Backtracking',
        'Greedy Algorithms',
        'Dynamic Programming',
        'BFS & DFS',
        'Shortest Path',
        'Topological Sorting'
    ]),

    buildModule('python-design-patterns', 'Design Patterns', [
        'Singleton',
        'Factory',
        'Abstract Factory',
        'Builder',
        'Strategy',
        'Observer',
        'Adapter',
        'Decorator Pattern',
        'Facade',
        'Repository',
        'Dependency Injection',
        'When & Why to Use Patterns'
    ]),

    buildModule('python-clean-code', 'Clean Code', [
        'SOLID Principles',
        'DRY, KISS & YAGNI',
        'Separation of Concerns',
        'Composition over Inheritance',
        'Code Smells',
        'Refactoring'
    ]),

    buildModule('python-architecture', 'Software Architecture', [
        'Layered Architecture',
        'MVC',
        'Clean Architecture',
        'Hexagonal Architecture',
        'Domain-Driven Design',
        'Microservices',
        'Event-Driven Architecture',
        'Message Queues',
        'CQRS'
    ]),

    buildModule('python-packaging', 'Python Packaging', [
        'pyproject.toml',
        'Build Systems',
        'Wheels & Source Distributions',
        'Publishing a Package',
        'Versioning',
        'Dependency Management',
        'Poetry, uv & pip-tools'
    ]),

    buildModule('python-linux', 'Linux & Python', [
        'Shell Basics',
        'Environment Variables',
        'Processes & Signals',
        'Permissions & the Filesystem',
        'Cron Jobs',
        'SSH',
        'Bash + Python Scripting'
    ]),

    buildModule('python-docker', 'Docker + Python', [
        'Writing a Dockerfile',
        'Images & Containers',
        'Volumes & Networks',
        'Docker Compose',
        'Environment Variables in Containers',
        'Multi-Stage Builds',
        'Project: FastAPI + PostgreSQL + Redis'
    ]),

    buildModule('python-cicd', 'CI/CD', [
        'Git & GitHub Workflow',
        'GitHub Actions',
        'Automated Testing in CI',
        'Linting & Formatting: Ruff & Black',
        'Type Checking with mypy',
        'Build & Deployment Pipelines'
    ]),

    buildModule('python-security', 'Security', [
        'Authentication vs Authorization',
        'JWT',
        'OAuth2',
        'Password Hashing',
        'Encryption Basics',
        'HTTPS',
        'CORS',
        'CSRF',
        'SQL Injection',
        'XSS',
        'SSRF',
        'Secrets Management',
        'Secure API Design'
    ]),

    // ----------------------------------------------------------- Specialisations
    buildModule('python-data-science', 'Data Science Ecosystem', [
        'NumPy Arrays',
        'Vectorization & Broadcasting',
        'Linear Algebra with NumPy',
        'Pandas Series & DataFrames',
        'Filtering & GroupBy',
        'Merge & Pivot',
        'Handling Missing Data',
        'Matplotlib',
        'Plotly',
        'scikit-learn Basics',
        'Feature Engineering',
        'Model Training & Evaluation',
        'Cross-Validation'
    ]),

    buildModule('python-ai-llm', 'AI / LLM Development', [
        'Calling LLM APIs',
        'Prompt Engineering',
        'Embeddings',
        'Vector Databases',
        'RAG',
        'Tool & Function Calling',
        'AI Agents',
        'Evaluating LLM Applications',
        'AI Application Architecture',
        'PyTorch & Transformers',
        'LangChain & LlamaIndex'
    ]),

    // ------------------------------------------------------------------ Mastery
    buildModule('python-performance', 'Performance Optimization', [
        'Profiling Basics',
        'timeit',
        'cProfile',
        'line_profiler',
        'Memory Profiling',
        'Algorithm Optimization',
        'Caching & Memoization',
        'Lazy Evaluation for Performance',
        'Database Optimization',
        'Async I/O for Performance',
        'Multiprocessing for Performance',
        'Why Is This Python Code Slow?'
    ]),

    buildModule('python-advanced', 'Advanced Python', [
        'Metaclasses',
        'Descriptors',
        '__slots__',
        'Dynamic Class Creation',
        'Reflection & Introspection',
        'Monkey Patching',
        'Import Hooks',
        'Custom Iterators & Containers',
        'AST Manipulation',
        'Bytecode',
        'C Extensions & Python/C Interop'
    ])
];

// Every topic gets the uniform deep dive (intro, need, real-time use, pros, cons, limits, diagram, code).
export const pythonModules: SubTopic[] = baseModules.map(m => ({
    ...m,
    topics: m.topics.map(t => withDeepDive(t, deepDives[t.name]))
}));
