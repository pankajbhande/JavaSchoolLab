// The Spring Boot syllabus: 30 modules, 521 numbered topics.
//
// Topics that were already written keep their own file and are wired into the slot the
// syllabus gives them; the rest are stubs carrying an id, a name and a short placeholder,
// and get their content filled in one at a time. Nothing else in this file is hand-edited -
// module and topic order follow the syllabus numbering exactly.

import type { SubTopic } from './types';
import { mergeTopics } from './mergeTopics';

import { springFrameworkIntroduction } from './topics/SpringFrameworkIntroduction';
import { springArchitecture } from './topics/SpringArchitecture';
import { springCoreIocDi } from './topics/SpringCoreIocDi';
import { springDependencyInjectionFundamentals } from './topics/SpringDependencyInjectionFundamentals';
import { springConstructorInjection } from './topics/SpringConstructorInjection';
import { springSetterInjection } from './topics/SpringSetterInjection';
import { springFieldInjection } from './topics/SpringFieldInjection';
import { springBeans } from './topics/SpringBeans';
import { springBeanLifecycle } from './topics/SpringBeanLifecycle';
import { springBeanScopes } from './topics/SpringBeanScopes';
import { springComponent } from './topics/SpringComponent';
import { springService } from './topics/SpringService';
import { springRepository } from './topics/SpringRepository';
import { springController } from './topics/SpringController';
import { springConfiguration } from './topics/SpringConfiguration';
import { springBean } from './topics/SpringBean';
import { springAutowired } from './topics/SpringAutowired';
import { springQualifier } from './topics/SpringQualifier';
import { springPrimary } from './topics/SpringPrimary';
import { springComponentScanning } from './topics/SpringComponentScanning';
import { springApplicationcontext } from './topics/SpringApplicationcontext';
import { springEnvironmentAndProfiles } from './topics/SpringEnvironmentAndProfiles';
import { springExpressionLanguageSpel } from './topics/SpringExpressionLanguageSpel';
import { introductionToSpringBoot } from './topics/IntroductionToSpringBoot';
import { springVsSpringBoot } from './topics/SpringVsSpringBoot';
import { springBootFeaturesAndArchitecture } from './topics/SpringBootFeaturesAndArchitecture';
import { springBootFeatures } from './topics/SpringBootFeatures';
import { springInitializr } from './topics/SpringInitializr';
import { springMavenGradleWithSpringBoot } from './topics/SpringMavenGradleWithSpringBoot';
import { springStarterDependencies } from './topics/SpringStarterDependencies';
import { springBootStarter } from './topics/SpringBootStarter';
import { springBootStarterWeb } from './topics/SpringBootStarterWeb';
import { springBootStarterDataJpa } from './topics/SpringBootStarterDataJpa';
import { springBootStarterValidation } from './topics/SpringBootStarterValidation';
import { springBootStarterSecurity } from './topics/SpringBootStarterSecurity';
import { springBootStarterTest } from './topics/SpringBootStarterTest';
import { springBootAnnotations } from './topics/SpringBootAnnotations';
import { springAutoConfiguration } from './topics/SpringAutoConfiguration';
import { springComponentScanningBasics } from './topics/SpringComponentScanningBasics';
import { springBootInternalWorking } from './topics/SpringBootInternalWorking';
import { springEmbeddedTomcat } from './topics/SpringEmbeddedTomcat';
import { springApplicationProperties } from './topics/SpringApplicationProperties';
import { springApplicationPropertiesBasics } from './topics/SpringApplicationPropertiesBasics';
import { springApplicationYml } from './topics/SpringApplicationYml';
import { springBootProfiles } from './topics/SpringBootProfiles';
import { springDevQaUatProdConfiguration } from './topics/SpringDevQaUatProdConfiguration';
import { springConfigurationProperties } from './topics/SpringConfigurationProperties';
import { springCustomProperties } from './topics/SpringCustomProperties';
import { springEnvironmentVariables } from './topics/SpringEnvironmentVariables';
import { springExternalizedConfiguration } from './topics/SpringExternalizedConfiguration';
import { springBootInternationalization } from './topics/SpringBootInternationalization';
import { restApiFundamentals } from './topics/RestApiFundamentals';
import { springHttpMethods } from './topics/SpringHttpMethods';
import { springGet } from './topics/SpringGet';
import { springPost } from './topics/SpringPost';
import { springPut } from './topics/SpringPut';
import { springPatch } from './topics/SpringPatch';
import { springDelete } from './topics/SpringDelete';
import { springHttpStatusCodes } from './topics/SpringHttpStatusCodes';
import { springBootRestApi } from './topics/SpringBootRestApi';
import { springRequestmapping } from './topics/SpringRequestmapping';
import { springGetmapping } from './topics/SpringGetmapping';
import { springPostmapping } from './topics/SpringPostmapping';
import { springPutmapping } from './topics/SpringPutmapping';
import { springPatchmapping } from './topics/SpringPatchmapping';
import { springDeletemapping } from './topics/SpringDeletemapping';
import { springPathvariable } from './topics/SpringPathvariable';
import { springRequestparam } from './topics/SpringRequestparam';
import { springRequestbody } from './topics/SpringRequestbody';
import { springRequestheader } from './topics/SpringRequestheader';
import { springCookievalue } from './topics/SpringCookievalue';
import { springResponseentity } from './topics/SpringResponseentity';
import { springDto } from './topics/SpringDto';
import { springRequestDto } from './topics/SpringRequestDto';
import { springResponseDto } from './topics/SpringResponseDto';
import { springEntityVsDto } from './topics/SpringEntityVsDto';
import { springBootApiDesign } from './topics/SpringBootApiDesign';
import { springRestApiNamingStandards } from './topics/SpringRestApiNamingStandards';
import { springPagination } from './topics/SpringPagination';
import { springSorting } from './topics/SpringSorting';
import { springFiltering } from './topics/SpringFiltering';
import { springSearchApis } from './topics/SpringSearchApis';
import { springApiResponseStructure } from './topics/SpringApiResponseStructure';
import { springCustomApiResponse } from './topics/SpringCustomApiResponse';
import { jsonFundamentals } from './topics/JsonFundamentals';
import { springBootCrudSaveUpdate } from './topics/SpringBootCrudSaveUpdate';
import { springBootCrudGetDelete } from './topics/SpringBootCrudGetDelete';
import { springBootInterceptor } from './topics/SpringBootInterceptor';
import { springBootExceptionHandling } from './topics/SpringBootExceptionHandling';
import { springCheckedVsUncheckedException } from './topics/SpringCheckedVsUncheckedException';
import { springCustomExceptions } from './topics/SpringCustomExceptions';
import { springExceptionhandler } from './topics/SpringExceptionhandler';
import { springControlleradvice } from './topics/SpringControlleradvice';
import { springRestcontrolleradvice } from './topics/SpringRestcontrolleradvice';
import { springGlobalExceptionHandling } from './topics/SpringGlobalExceptionHandling';
import { springCustomErrorResponse } from './topics/SpringCustomErrorResponse';
import { springValidationExceptionHandling } from './topics/SpringValidationExceptionHandling';
import { springBusinessExceptionHandling } from './topics/SpringBusinessExceptionHandling';
import { springHttpErrorHandling } from './topics/SpringHttpErrorHandling';
import { springErrorCodes } from './topics/SpringErrorCodes';
import { springExceptionLogging } from './topics/SpringExceptionLogging';
import { springOrm } from './topics/SpringOrm';
import { springJpa } from './topics/SpringJpa';
import { springHibernate } from './topics/SpringHibernate';
import { springDataJpa } from './topics/SpringDataJpa';
import { springEntity } from './topics/SpringEntity';
import { springEntityJpa } from './topics/SpringEntityJpa';
import { springTable } from './topics/SpringTable';
import { springId } from './topics/SpringId';
import { springGeneratedvalue } from './topics/SpringGeneratedvalue';
import { springColumn } from './topics/SpringColumn';
import { springTransient } from './topics/SpringTransient';
import { springEnumerated } from './topics/SpringEnumerated';
import { springLob } from './topics/SpringLob';
import { springEntityLifecycle } from './topics/SpringEntityLifecycle';
import { springRepositoryJpa } from './topics/SpringRepositoryJpa';
import { springJparepository } from './topics/SpringJparepository';
import { springCrudrepository } from './topics/SpringCrudrepository';
import { springPagingandsortingrepository } from './topics/SpringPagingandsortingrepository';
import { springBootDerivedQueries } from './topics/SpringBootDerivedQueries';
import { springJpql } from './topics/SpringJpql';
import { springNativeQuery } from './topics/SpringNativeQuery';
import { springBootNativeQuery } from './topics/SpringBootNativeQuery';
import { springModifying } from './topics/SpringModifying';
import { springTransactional } from './topics/SpringTransactional';
import { springBootMappingScenarios } from './topics/SpringBootMappingScenarios';
import { springBootOneToOneAndOneToMany } from './topics/SpringBootOneToOneAndOneToMany';
import { springOneToMany } from './topics/SpringOneToMany';
import { springBootManyToOneAndManyToMany } from './topics/SpringBootManyToOneAndManyToMany';
import { springManyToMany } from './topics/SpringManyToMany';
import { springCascade } from './topics/SpringCascade';
import { springFetchType } from './topics/SpringFetchType';
import { springLazyLoading } from './topics/SpringLazyLoading';
import { springEagerLoading } from './topics/SpringEagerLoading';
import { springBootJoinQueries } from './topics/SpringBootJoinQueries';
import { springNPlus1Problem } from './topics/SpringNPlus1Problem';
import { springEntityGraph } from './topics/SpringEntityGraph';
import { springSpecifications } from './topics/SpringSpecifications';
import { springCriteriaApi } from './topics/SpringCriteriaApi';
import { springBootJpaAdvanced } from './topics/SpringBootJpaAdvanced';
import { springOptimisticLocking } from './topics/SpringOptimisticLocking';
import { springPessimisticLocking } from './topics/SpringPessimisticLocking';
import { springMysql } from './topics/SpringMysql';
import { springPostgresql } from './topics/SpringPostgresql';
import { springOracle } from './topics/SpringOracle';
import { springSqlServer } from './topics/SpringSqlServer';
import { springJdbc } from './topics/SpringJdbc';
import { springDatasource } from './topics/SpringDatasource';
import { springConnectionPool } from './topics/SpringConnectionPool';
import { springHikaricp } from './topics/SpringHikaricp';
import { springBootMultipleDatabases } from './topics/SpringBootMultipleDatabases';
import { springTransactions } from './topics/SpringTransactions';
import { springIsolationLevels } from './topics/SpringIsolationLevels';
import { springAcidProperties } from './topics/SpringAcidProperties';
import { springDatabaseMigration } from './topics/SpringDatabaseMigration';
import { springFlyway } from './topics/SpringFlyway';
import { springLiquibase } from './topics/SpringLiquibase';
import { springDatabaseIndexing } from './topics/SpringDatabaseIndexing';
import { springQueryOptimization } from './topics/SpringQueryOptimization';
import { springBootValidation } from './topics/SpringBootValidation';
import { springJakartaValidation } from './topics/SpringJakartaValidation';
import { springValid } from './topics/SpringValid';
import { springValidated } from './topics/SpringValidated';
import { springNotnull } from './topics/SpringNotnull';
import { springNotblank } from './topics/SpringNotblank';
import { springNotempty } from './topics/SpringNotempty';
import { springSize } from './topics/SpringSize';
import { springMin } from './topics/SpringMin';
import { springMax } from './topics/SpringMax';
import { springEmail } from './topics/SpringEmail';
import { springPattern } from './topics/SpringPattern';
import { springCustomValidation } from './topics/SpringCustomValidation';
import { springCustomValidator } from './topics/SpringCustomValidator';
import { springValidationGroups } from './topics/SpringValidationGroups';
import { springRequestValidation } from './topics/SpringRequestValidation';
import { springServiceLevelValidation } from './topics/SpringServiceLevelValidation';
import { springServiceLayer } from './topics/SpringServiceLayer';
import { springServiceService } from './topics/SpringServiceService';
import { springBusinessLogicDesign } from './topics/SpringBusinessLogicDesign';
import { springSeparationOfConcerns } from './topics/SpringSeparationOfConcerns';
import { springEntityToDtoConversion } from './topics/SpringEntityToDtoConversion';
import { springDtoMapping } from './topics/SpringDtoMapping';
import { springMapperClasses } from './topics/SpringMapperClasses';
import { springBusinessRules } from './topics/SpringBusinessRules';
import { springConditionalBusinessLogic } from './topics/SpringConditionalBusinessLogic';
import { springTransactionalBusinessLogic } from './topics/SpringTransactionalBusinessLogic';
import { springWorkflowProcessing } from './topics/SpringWorkflowProcessing';
import { springStateManagement } from './topics/SpringStateManagement';
import { springStatusBasedProcessing } from './topics/SpringStatusBasedProcessing';
import { springRuleEngineConcepts } from './topics/SpringRuleEngineConcepts';
import { springStrategyPatternInBusinessLogic } from './topics/SpringStrategyPatternInBusinessLogic';
import { springFactoryPatternInSpringBoot } from './topics/SpringFactoryPatternInSpringBoot';
import { springBootSecurity } from './topics/SpringBootSecurity';
import { springAuthentication } from './topics/SpringAuthentication';
import { springAuthorization } from './topics/SpringAuthorization';
import { springBootSecurityHandsOn } from './topics/SpringBootSecurityHandsOn';
import { springSecurityfilterchain } from './topics/SpringSecurityfilterchain';
import { springUserdetails } from './topics/SpringUserdetails';
import { springUserdetailsservice } from './topics/SpringUserdetailsservice';
import { springPasswordEncoding } from './topics/SpringPasswordEncoding';
import { springBcrypt } from './topics/SpringBcrypt';
import { springRoles } from './topics/SpringRoles';
import { springAuthorities } from './topics/SpringAuthorities';
import { springRbac } from './topics/SpringRbac';
import { springMethodLevelSecurity } from './topics/SpringMethodLevelSecurity';
import { springPreauthorize } from './topics/SpringPreauthorize';
import { springPostauthorize } from './topics/SpringPostauthorize';
import { springSecured } from './topics/SpringSecured';
import { springCsrf } from './topics/SpringCsrf';
import { springCors } from './topics/SpringCors';
import { springSessionBasedAuthentication } from './topics/SpringSessionBasedAuthentication';
import { springStatelessAuthentication } from './topics/SpringStatelessAuthentication';
import { springJwt } from './topics/SpringJwt';
import { springBootJwtAuthentication } from './topics/SpringBootJwtAuthentication';
import { springRefreshToken } from './topics/SpringRefreshToken';
import { springOauth20 } from './topics/SpringOauth20';
import { springOpenidConnect } from './topics/SpringOpenidConnect';
import { springSocialLogin } from './topics/SpringSocialLogin';
import { springResourceServer } from './topics/SpringResourceServer';
import { springApiSecurity } from './topics/SpringApiSecurity';
import { springSecurityExceptionHandling } from './topics/SpringSecurityExceptionHandling';
import { springLoginApi } from './topics/SpringLoginApi';
import { springRegistrationApi } from './topics/SpringRegistrationApi';
import { springPasswordHashing } from './topics/SpringPasswordHashing';
import { springAccessToken } from './topics/SpringAccessToken';
import { springRefreshTokenJwt } from './topics/SpringRefreshTokenJwt';
import { springJwtStructure } from './topics/SpringJwtStructure';
import { springJwtClaims } from './topics/SpringJwtClaims';
import { springJwtValidation } from './topics/SpringJwtValidation';
import { springJwtFilter } from './topics/SpringJwtFilter';
import { springTokenExpiration } from './topics/SpringTokenExpiration';
import { springTokenRevocation } from './topics/SpringTokenRevocation';
import { springRoleBasedAuthorization } from './topics/SpringRoleBasedAuthorization';
import { springPermissionBasedAuthorization } from './topics/SpringPermissionBasedAuthorization';
import { springBootAop } from './topics/SpringBootAop';
import { springCrossCuttingConcerns } from './topics/SpringCrossCuttingConcerns';
import { springAspect } from './topics/SpringAspect';
import { springJoinPoint } from './topics/SpringJoinPoint';
import { springPointcut } from './topics/SpringPointcut';
import { springAdvice } from './topics/SpringAdvice';
import { springBeforeAdvice } from './topics/SpringBeforeAdvice';
import { springAfterAdvice } from './topics/SpringAfterAdvice';
import { springAroundAdvice } from './topics/SpringAroundAdvice';
import { springAspectAop } from './topics/SpringAspectAop';
import { springBefore } from './topics/SpringBefore';
import { springAfter } from './topics/SpringAfter';
import { springAround } from './topics/SpringAround';
import { springLoggingUsingAop } from './topics/SpringLoggingUsingAop';
import { springPerformanceMonitoringUsingAop } from './topics/SpringPerformanceMonitoringUsingAop';
import { springTransactionManagementUsingAop } from './topics/SpringTransactionManagementUsingAop';
import { springBootTransactionManagement } from './topics/SpringBootTransactionManagement';
import { springTransactionalTransactions } from './topics/SpringTransactionalTransactions';
import { springTransactionPropagation } from './topics/SpringTransactionPropagation';
import { springRequired } from './topics/SpringRequired';
import { springRequiresNew } from './topics/SpringRequiresNew';
import { springSupports } from './topics/SpringSupports';
import { springNotSupported } from './topics/SpringNotSupported';
import { springMandatory } from './topics/SpringMandatory';
import { springNever } from './topics/SpringNever';
import { springNested } from './topics/SpringNested';
import { springTransactionIsolation } from './topics/SpringTransactionIsolation';
import { springReadUncommitted } from './topics/SpringReadUncommitted';
import { springReadCommitted } from './topics/SpringReadCommitted';
import { springRepeatableRead } from './topics/SpringRepeatableRead';
import { springSerializable } from './topics/SpringSerializable';
import { springRollbackRules } from './topics/SpringRollbackRules';
import { springTransactionBoundary } from './topics/SpringTransactionBoundary';
import { springDistributedTransactions } from './topics/SpringDistributedTransactions';
import { springBootLogging } from './topics/SpringBootLogging';
import { springSlf4j } from './topics/SpringSlf4j';
import { springLogback } from './topics/SpringLogback';
import { springLogLevels } from './topics/SpringLogLevels';
import { springDebug } from './topics/SpringDebug';
import { springInfo } from './topics/SpringInfo';
import { springWarn } from './topics/SpringWarn';
import { springError } from './topics/SpringError';
import { springStructuredLogging } from './topics/SpringStructuredLogging';
import { springRequestResponseLogging } from './topics/SpringRequestResponseLogging';
import { springCorrelationId } from './topics/SpringCorrelationId';
import { springMdc } from './topics/SpringMdc';
import { springProductionLogging } from './topics/SpringProductionLogging';
import { springLogRotation } from './topics/SpringLogRotation';
import { springBootUnitTesting } from './topics/SpringBootUnitTesting';
import { springBootIntegrationTesting } from './topics/SpringBootIntegrationTesting';
import { springJunit5 } from './topics/SpringJunit5';
import { springMockito } from './topics/SpringMockito';
import { springMocking } from './topics/SpringMocking';
import { springMock } from './topics/SpringMock';
import { springInjectmocks } from './topics/SpringInjectmocks';
import { springMockbean } from './topics/SpringMockbean';
import { springBootTesting } from './topics/SpringBootTesting';
import { springWebmvctest } from './topics/SpringWebmvctest';
import { springDatajpatest } from './topics/SpringDatajpatest';
import { springControllerTesting } from './topics/SpringControllerTesting';
import { springServiceTesting } from './topics/SpringServiceTesting';
import { springRepositoryTesting } from './topics/SpringRepositoryTesting';
import { springRestApiTesting } from './topics/SpringRestApiTesting';
import { springMockmvc } from './topics/SpringMockmvc';
import { springTestcontainers } from './topics/SpringTestcontainers';
import { springIntegrationTestDatabase } from './topics/SpringIntegrationTestDatabase';
import { springTestCoverage } from './topics/SpringTestCoverage';
import { springBootActuator } from './topics/SpringBootActuator';
import { springHealthCheck } from './topics/SpringHealthCheck';
import { springMetrics } from './topics/SpringMetrics';
import { springActuatorHealth } from './topics/SpringActuatorHealth';
import { springActuatorInfo } from './topics/SpringActuatorInfo';
import { springActuatorMetrics } from './topics/SpringActuatorMetrics';
import { springActuatorPrometheus } from './topics/SpringActuatorPrometheus';
import { springCustomActuatorEndpoint } from './topics/SpringCustomActuatorEndpoint';
import { springApplicationMonitoring } from './topics/SpringApplicationMonitoring';
import { springJvmMonitoring } from './topics/SpringJvmMonitoring';
import { springMemoryMonitoring } from './topics/SpringMemoryMonitoring';
import { springThreadMonitoring } from './topics/SpringThreadMonitoring';
import { springDatabaseMonitoring } from './topics/SpringDatabaseMonitoring';
import { springMonolithicArchitecture } from './topics/SpringMonolithicArchitecture';
import { springBootMicroservicesIntro } from './topics/SpringBootMicroservicesIntro';
import { springMicroserviceDesign } from './topics/SpringMicroserviceDesign';
import { springServiceDecomposition } from './topics/SpringServiceDecomposition';
import { springApiGateway } from './topics/SpringApiGateway';
import { springServiceDiscovery } from './topics/SpringServiceDiscovery';
import { springLoadBalancing } from './topics/SpringLoadBalancing';
import { springInterServiceCommunication } from './topics/SpringInterServiceCommunication';
import { springRestCommunication } from './topics/SpringRestCommunication';
import { springOpenfeign } from './topics/SpringOpenfeign';
import { springBootServiceCommunication } from './topics/SpringBootServiceCommunication';
import { springRestclient } from './topics/SpringRestclient';
import { springServiceRegistry } from './topics/SpringServiceRegistry';
import { springBootEurekaRegistry } from './topics/SpringBootEurekaRegistry';
import { springConfigServer } from './topics/SpringConfigServer';
import { springCentralizedConfiguration } from './topics/SpringCentralizedConfiguration';
import { springDistributedTracing } from './topics/SpringDistributedTracing';
import { springCircuitBreaker } from './topics/SpringCircuitBreaker';
import { springRetry } from './topics/SpringRetry';
import { springTimeout } from './topics/SpringTimeout';
import { springRateLimiting } from './topics/SpringRateLimiting';
import { springFaultTolerance } from './topics/SpringFaultTolerance';
import { springCloudIntroduction } from './topics/SpringCloudIntroduction';
import { springCloudConfig } from './topics/SpringCloudConfig';
import { springEureka } from './topics/SpringEureka';
import { springCloudGateway } from './topics/SpringCloudGateway';
import { springOpenfeignCloud } from './topics/SpringOpenfeignCloud';
import { springCircuitBreakerCloud } from './topics/SpringCircuitBreakerCloud';
import { springResilience4j } from './topics/SpringResilience4j';
import { springLoadBalancingCloud } from './topics/SpringLoadBalancingCloud';
import { springDistributedTracingCloud } from './topics/SpringDistributedTracingCloud';
import { springMicrometer } from './topics/SpringMicrometer';
import { springServiceToServiceCommunication } from './topics/SpringServiceToServiceCommunication';
import { springApiGatewaySecurity } from './topics/SpringApiGatewaySecurity';
import { springBootKafka } from './topics/SpringBootKafka';
import { springProducer } from './topics/SpringProducer';
import { springConsumer } from './topics/SpringConsumer';
import { springTopic } from './topics/SpringTopic';
import { springPartition } from './topics/SpringPartition';
import { springOffset } from './topics/SpringOffset';
import { springConsumerGroup } from './topics/SpringConsumerGroup';
import { springKafkaConfiguration } from './topics/SpringKafkaConfiguration';
import { springKafkaProducerInSpringBoot } from './topics/SpringKafkaProducerInSpringBoot';
import { springKafkaConsumerInSpringBoot } from './topics/SpringKafkaConsumerInSpringBoot';
import { springJsonSerialization } from './topics/SpringJsonSerialization';
import { springErrorHandling } from './topics/SpringErrorHandling';
import { springRetryKafka } from './topics/SpringRetryKafka';
import { springDeadLetterTopic } from './topics/SpringDeadLetterTopic';
import { springKafkaTransactions } from './topics/SpringKafkaTransactions';
import { springEventDrivenArchitecture } from './topics/SpringEventDrivenArchitecture';
import { springEventualConsistency } from './topics/SpringEventualConsistency';
import { springSagaPattern } from './topics/SpringSagaPattern';
import { springOutboxPattern } from './topics/SpringOutboxPattern';
import { springRabbitmq } from './topics/SpringRabbitmq';
import { springMessageQueue } from './topics/SpringMessageQueue';
import { springExchange } from './topics/SpringExchange';
import { springQueue } from './topics/SpringQueue';
import { springRoutingKey } from './topics/SpringRoutingKey';
import { springBinding } from './topics/SpringBinding';
import { springProducerConsumer } from './topics/SpringProducerConsumer';
import { springAmqp } from './topics/SpringAmqp';
import { springMessageRetry } from './topics/SpringMessageRetry';
import { springDeadLetterQueue } from './topics/SpringDeadLetterQueue';
import { springCachingConcepts } from './topics/SpringCachingConcepts';
import { springBootCaching } from './topics/SpringBootCaching';
import { springCacheable } from './topics/SpringCacheable';
import { springCacheput } from './topics/SpringCacheput';
import { springCacheevict } from './topics/SpringCacheevict';
import { springRedis } from './topics/SpringRedis';
import { springRedisIntegration } from './topics/SpringRedisIntegration';
import { springRedisCache } from './topics/SpringRedisCache';
import { springCacheTtl } from './topics/SpringCacheTtl';
import { springCacheInvalidation } from './topics/SpringCacheInvalidation';
import { springDistributedCache } from './topics/SpringDistributedCache';
import { springBootSchedulingAsync } from './topics/SpringBootSchedulingAsync';
import { springScheduled } from './topics/SpringScheduled';
import { springCronExpressions } from './topics/SpringCronExpressions';
import { springFixedRate } from './topics/SpringFixedRate';
import { springFixedDelay } from './topics/SpringFixedDelay';
import { springAsyncProcessing } from './topics/SpringAsyncProcessing';
import { springAsync } from './topics/SpringAsync';
import { springExecutorservice } from './topics/SpringExecutorservice';
import { springThreadPool } from './topics/SpringThreadPool';
import { springCompletablefuture } from './topics/SpringCompletablefuture';
import { springBackgroundProcessing } from './topics/SpringBackgroundProcessing';
import { springBootBatch } from './topics/SpringBootBatch';
import { springBootFileUploadDownload } from './topics/SpringBootFileUploadDownload';
import { springMultipartFile } from './topics/SpringMultipartFile';
import { springFileDownload } from './topics/SpringFileDownload';
import { springLargeFileUpload } from './topics/SpringLargeFileUpload';
import { springFileStorage } from './topics/SpringFileStorage';
import { springLocalFileStorage } from './topics/SpringLocalFileStorage';
import { springAwsS3 } from './topics/SpringAwsS3';
import { springCloudFileStorage } from './topics/SpringCloudFileStorage';
import { springFileValidation } from './topics/SpringFileValidation';
import { springFileMetadata } from './topics/SpringFileMetadata';
import { springBootCsvImportExport } from './topics/SpringBootCsvImportExport';
import { springBootExcelExport } from './topics/SpringBootExcelExport';
import { springBootPdfExport } from './topics/SpringBootPdfExport';
import { springBootMailSending } from './topics/SpringBootMailSending';
import { springMail } from './topics/SpringMail';
import { springSmtp } from './topics/SpringSmtp';
import { springHtmlEmail } from './topics/SpringHtmlEmail';
import { springEmailTemplates } from './topics/SpringEmailTemplates';
import { springOtpEmail } from './topics/SpringOtpEmail';
import { springNotificationService } from './topics/SpringNotificationService';
import { springBootSmsOtp } from './topics/SpringBootSmsOtp';
import { springPushNotifications } from './topics/SpringPushNotifications';
import { springBootSwagger } from './topics/SpringBootSwagger';
import { springOpenapi } from './topics/SpringOpenapi';
import { springdocOpenapi } from './topics/SpringdocOpenapi';
import { springApiDocumentation } from './topics/SpringApiDocumentation';
import { springApiTags } from './topics/SpringApiTags';
import { springApiSchemas } from './topics/SpringApiSchemas';
import { springApiSecurityDocumentation } from './topics/SpringApiSecurityDocumentation';
import { springSwaggerUi } from './topics/SpringSwaggerUi';
import { springBootPerformance } from './topics/SpringBootPerformance';
import { springJvmPerformance } from './topics/SpringJvmPerformance';
import { springDatabaseOptimization } from './topics/SpringDatabaseOptimization';
import { springQueryOptimizationPerformance } from './topics/SpringQueryOptimizationPerformance';
import { springConnectionPoolOptimization } from './topics/SpringConnectionPoolOptimization';
import { springLazyVsEagerLoading } from './topics/SpringLazyVsEagerLoading';
import { springCaching } from './topics/SpringCaching';
import { springPaginationPerformance } from './topics/SpringPaginationPerformance';
import { springAsyncProcessingPerformance } from './topics/SpringAsyncProcessingPerformance';
import { springThreadPoolOptimization } from './topics/SpringThreadPoolOptimization';
import { springApiResponseOptimization } from './topics/SpringApiResponseOptimization';
import { springMemoryOptimization } from './topics/SpringMemoryOptimization';
import { springGarbageCollectionBasics } from './topics/SpringGarbageCollectionBasics';
import { springLoadTesting } from './topics/SpringLoadTesting';
import { springStressTesting } from './topics/SpringStressTesting';
import { springSingleton } from './topics/SpringSingleton';
import { springFactory } from './topics/SpringFactory';
import { springAbstractFactory } from './topics/SpringAbstractFactory';
import { springBuilder } from './topics/SpringBuilder';
import { springStrategy } from './topics/SpringStrategy';
import { springObserver } from './topics/SpringObserver';
import { springAdapter } from './topics/SpringAdapter';
import { springDecorator } from './topics/SpringDecorator';
import { springProxy } from './topics/SpringProxy';
import { springTemplateMethod } from './topics/SpringTemplateMethod';
import { springChainOfResponsibility } from './topics/SpringChainOfResponsibility';
import { springSpecificationPattern } from './topics/SpringSpecificationPattern';
import { springRepositoryPattern } from './topics/SpringRepositoryPattern';
import { springDependencyInjectionPattern } from './topics/SpringDependencyInjectionPattern';
import { springLayeredArchitecture } from './topics/SpringLayeredArchitecture';
import { springMvcArchitecture } from './topics/SpringMvcArchitecture';
import { springCleanArchitecture } from './topics/SpringCleanArchitecture';
import { springHexagonalArchitecture } from './topics/SpringHexagonalArchitecture';
import { springOnionArchitecture } from './topics/SpringOnionArchitecture';
import { springSolidPrinciples } from './topics/SpringSolidPrinciples';
import { springDry } from './topics/SpringDry';
import { springKiss } from './topics/SpringKiss';
import { springYagni } from './topics/SpringYagni';
import { springSeparationOfConcernsArchitecture } from './topics/SpringSeparationOfConcernsArchitecture';
import { springDependencyInversion } from './topics/SpringDependencyInversion';
import { springDomainDrivenDesign } from './topics/SpringDomainDrivenDesign';
import { springBoundedContext } from './topics/SpringBoundedContext';
import { springAggregate } from './topics/SpringAggregate';
import { springDomainService } from './topics/SpringDomainService';
import { springApplicationService } from './topics/SpringApplicationService';
import { springProductionConfiguration } from './topics/SpringProductionConfiguration';
import { springEnvironmentManagement } from './topics/SpringEnvironmentManagement';
import { springSecretsManagement } from './topics/SpringSecretsManagement';
import { springDatabaseSecurity } from './topics/SpringDatabaseSecurity';
import { springApiSecurityProduction } from './topics/SpringApiSecurityProduction';
import { springRateLimitingProduction } from './topics/SpringRateLimitingProduction';
import { springAuditLogging } from './topics/SpringAuditLogging';
import { springMonitoring } from './topics/SpringMonitoring';
import { springAlerting } from './topics/SpringAlerting';
import { springHealthChecks } from './topics/SpringHealthChecks';
import { springGracefulShutdown } from './topics/SpringGracefulShutdown';
import { springErrorTracking } from './topics/SpringErrorTracking';
import { springDistributedTracingProduction } from './topics/SpringDistributedTracingProduction';
import { springPerformanceMonitoring } from './topics/SpringPerformanceMonitoring';
import { springProductionDeployment } from './topics/SpringProductionDeployment';
import { springGit } from './topics/SpringGit';
import { springGithubGitlab } from './topics/SpringGithubGitlab';
import { springBootExecutableJar } from './topics/SpringBootExecutableJar';
import { springCiCd } from './topics/SpringCiCd';
import { springJenkins } from './topics/SpringJenkins';
import { springGithubActions } from './topics/SpringGithubActions';
import { springBootDocker } from './topics/SpringBootDocker';
import { springDockerfile } from './topics/SpringDockerfile';
import { springDockerCompose } from './topics/SpringDockerCompose';
import { springKubernetes } from './topics/SpringKubernetes';
import { springKubernetesDeployment } from './topics/SpringKubernetesDeployment';
import { springKubernetesService } from './topics/SpringKubernetesService';
import { springConfigmap } from './topics/SpringConfigmap';
import { springSecret } from './topics/SpringSecret';
import { springIngress } from './topics/SpringIngress';
import { springAwsDeployment } from './topics/SpringAwsDeployment';
import { springAzureDeployment } from './topics/SpringAzureDeployment';
import { springGcpDeployment } from './topics/SpringGcpDeployment';
import { springLinuxServerDeployment } from './topics/SpringLinuxServerDeployment';
import { springDistributedSystems } from './topics/SpringDistributedSystems';
import { springDistributedTransactionsEnterprise } from './topics/SpringDistributedTransactionsEnterprise';
import { springSagaPatternEnterprise } from './topics/SpringSagaPatternEnterprise';
import { springCqrs } from './topics/SpringCqrs';
import { springEventSourcing } from './topics/SpringEventSourcing';
import { springIdempotency } from './topics/SpringIdempotency';
import { springDistributedLock } from './topics/SpringDistributedLock';
import { springLeaderElection } from './topics/SpringLeaderElection';
import { springOutboxPatternEnterprise } from './topics/SpringOutboxPatternEnterprise';
import { springRetryPattern } from './topics/SpringRetryPattern';
import { springCircuitBreakerPattern } from './topics/SpringCircuitBreakerPattern';
import { springBulkheadPattern } from './topics/SpringBulkheadPattern';
import { springRateLimiterPattern } from './topics/SpringRateLimiterPattern';
import { springTimeoutPattern } from './topics/SpringTimeoutPattern';
import { springCompensationPattern } from './topics/SpringCompensationPattern';
import { springEventualConsistencyEnterprise } from './topics/SpringEventualConsistencyEnterprise';
import { springCapTheorem } from './topics/SpringCapTheorem';
import { springConsistencyModels } from './topics/SpringConsistencyModels';
import { springScalability } from './topics/SpringScalability';
import { springHighAvailability } from './topics/SpringHighAvailability';
import { springFaultToleranceEnterprise } from './topics/SpringFaultToleranceEnterprise';

export const springBootModules: SubTopic[] = [
    {
        // 1. Spring Framework Fundamentals
        id: 'springboot-fundamentals',
        name: 'Spring Framework Fundamentals',
        topics: [
            mergeTopics("Spring Framework Introduction & Architecture", [springFrameworkIntroduction, springArchitecture]),
            mergeTopics("IoC & Dependency Injection", [springCoreIocDi, springDependencyInjectionFundamentals, springConstructorInjection, springSetterInjection, springFieldInjection]),
            mergeTopics("Spring Beans: Lifecycle & Scopes", [springBeans, springBeanLifecycle, springBeanScopes]),
            mergeTopics("Stereotype Annotations", [springComponent, springService, springRepository, springController]),
            mergeTopics("Java Configuration & @Bean", [springConfiguration, springBean]),
            mergeTopics("Autowiring: @Autowired, @Qualifier & @Primary", [springAutowired, springQualifier, springPrimary]),
            mergeTopics("Component Scanning & ApplicationContext", [springComponentScanning, springApplicationcontext]),
            mergeTopics("Environment, Profiles & SpEL", [springEnvironmentAndProfiles, springExpressionLanguageSpel]),
        ]
    },
    {
        // 2. Spring Boot Basics
        id: 'springboot-basics',
        name: 'Spring Boot Basics',
        topics: [
            introductionToSpringBoot,
            springVsSpringBoot,
            springBootFeaturesAndArchitecture,
            springBootFeatures,
            springInitializr,
            springMavenGradleWithSpringBoot,
            springStarterDependencies,
            springBootStarter,
            springBootStarterWeb,
            springBootStarterDataJpa,
            springBootStarterValidation,
            springBootStarterSecurity,
            springBootStarterTest,
            springBootAnnotations,
            springAutoConfiguration,
            springComponentScanningBasics,
            springBootInternalWorking,
            springEmbeddedTomcat,
            springApplicationProperties,
            springApplicationPropertiesBasics,
            springApplicationYml,
            springBootProfiles,
            springDevQaUatProdConfiguration,
            springConfigurationProperties,
            springCustomProperties,
            springEnvironmentVariables,
            springExternalizedConfiguration,
            springBootInternationalization,
        ]
    },
    {
        // 3. REST API Development
        id: 'springboot-rest',
        name: 'REST API Development',
        topics: [
            restApiFundamentals,
            springHttpMethods,
            springGet,
            springPost,
            springPut,
            springPatch,
            springDelete,
            springHttpStatusCodes,
            springBootRestApi,
            springRequestmapping,
            springGetmapping,
            springPostmapping,
            springPutmapping,
            springPatchmapping,
            springDeletemapping,
            springPathvariable,
            springRequestparam,
            springRequestbody,
            springRequestheader,
            springCookievalue,
            springResponseentity,
            springDto,
            springRequestDto,
            springResponseDto,
            springEntityVsDto,
            springBootApiDesign,
            springRestApiNamingStandards,
            springPagination,
            springSorting,
            springFiltering,
            springSearchApis,
            springApiResponseStructure,
            springCustomApiResponse,
            jsonFundamentals,
            springBootCrudSaveUpdate,
            springBootCrudGetDelete,
            springBootInterceptor,
        ]
    },
    {
        // 4. Exception Handling
        id: 'springboot-exceptions',
        name: 'Exception Handling',
        topics: [
            springBootExceptionHandling,
            springCheckedVsUncheckedException,
            springCustomExceptions,
            springExceptionhandler,
            springControlleradvice,
            springRestcontrolleradvice,
            springGlobalExceptionHandling,
            springCustomErrorResponse,
            springValidationExceptionHandling,
            springBusinessExceptionHandling,
            springHttpErrorHandling,
            springErrorCodes,
            springExceptionLogging,
        ]
    },
    {
        // 5. Spring Data JPA
        id: 'springboot-jpa',
        name: 'Spring Data JPA',
        topics: [
            springOrm,
            springJpa,
            springHibernate,
            springDataJpa,
            springEntity,
            springEntityJpa,
            springTable,
            springId,
            springGeneratedvalue,
            springColumn,
            springTransient,
            springEnumerated,
            springLob,
            springEntityLifecycle,
            springRepositoryJpa,
            springJparepository,
            springCrudrepository,
            springPagingandsortingrepository,
            springBootDerivedQueries,
            springJpql,
            springNativeQuery,
            springBootNativeQuery,
            springModifying,
            springTransactional,
            springBootMappingScenarios,
            springBootOneToOneAndOneToMany,
            springOneToMany,
            springBootManyToOneAndManyToMany,
            springManyToMany,
            springCascade,
            springFetchType,
            springLazyLoading,
            springEagerLoading,
            springBootJoinQueries,
            springNPlus1Problem,
            springEntityGraph,
            springSpecifications,
            springCriteriaApi,
            springBootJpaAdvanced,
            springOptimisticLocking,
            springPessimisticLocking,
        ]
    },
    {
        // 6. Database Integration
        id: 'springboot-database',
        name: 'Database Integration',
        topics: [
            springMysql,
            springPostgresql,
            springOracle,
            springSqlServer,
            springJdbc,
            springDatasource,
            springConnectionPool,
            springHikaricp,
            springBootMultipleDatabases,
            springTransactions,
            springIsolationLevels,
            springAcidProperties,
            springDatabaseMigration,
            springFlyway,
            springLiquibase,
            springDatabaseIndexing,
            springQueryOptimization,
        ]
    },
    {
        // 7. Validation
        id: 'springboot-validation',
        name: 'Validation',
        topics: [
            springBootValidation,
            springJakartaValidation,
            springValid,
            springValidated,
            springNotnull,
            springNotblank,
            springNotempty,
            springSize,
            springMin,
            springMax,
            springEmail,
            springPattern,
            springCustomValidation,
            springCustomValidator,
            springValidationGroups,
            springRequestValidation,
            springServiceLevelValidation,
        ]
    },
    {
        // 8. Service Layer & Business Logic
        id: 'springboot-service',
        name: 'Service Layer & Business Logic',
        topics: [
            springServiceLayer,
            springServiceService,
            springBusinessLogicDesign,
            springSeparationOfConcerns,
            springEntityToDtoConversion,
            springDtoMapping,
            springMapperClasses,
            springBusinessRules,
            springConditionalBusinessLogic,
            springTransactionalBusinessLogic,
            springWorkflowProcessing,
            springStateManagement,
            springStatusBasedProcessing,
            springRuleEngineConcepts,
            springStrategyPatternInBusinessLogic,
            springFactoryPatternInSpringBoot,
        ]
    },
    {
        // 9. Spring Security
        id: 'springboot-security',
        name: 'Spring Security',
        topics: [
            springBootSecurity,
            springAuthentication,
            springAuthorization,
            springBootSecurityHandsOn,
            springSecurityfilterchain,
            springUserdetails,
            springUserdetailsservice,
            springPasswordEncoding,
            springBcrypt,
            springRoles,
            springAuthorities,
            springRbac,
            springMethodLevelSecurity,
            springPreauthorize,
            springPostauthorize,
            springSecured,
            springCsrf,
            springCors,
            springSessionBasedAuthentication,
            springStatelessAuthentication,
            springJwt,
            springBootJwtAuthentication,
            springRefreshToken,
            springOauth20,
            springOpenidConnect,
            springSocialLogin,
            springResourceServer,
            springApiSecurity,
            springSecurityExceptionHandling,
        ]
    },
    {
        // 10. JWT-Based Authentication
        id: 'springboot-jwt',
        name: 'JWT-Based Authentication',
        topics: [
            springLoginApi,
            springRegistrationApi,
            springPasswordHashing,
            springAccessToken,
            springRefreshTokenJwt,
            springJwtStructure,
            springJwtClaims,
            springJwtValidation,
            springJwtFilter,
            springTokenExpiration,
            springTokenRevocation,
            springRoleBasedAuthorization,
            springPermissionBasedAuthorization,
        ]
    },
    {
        // 11. AOP
        id: 'springboot-aop',
        name: 'AOP',
        topics: [
            springBootAop,
            springCrossCuttingConcerns,
            springAspect,
            springJoinPoint,
            springPointcut,
            springAdvice,
            springBeforeAdvice,
            springAfterAdvice,
            springAroundAdvice,
            springAspectAop,
            springBefore,
            springAfter,
            springAround,
            springLoggingUsingAop,
            springPerformanceMonitoringUsingAop,
            springTransactionManagementUsingAop,
        ]
    },
    {
        // 12. Spring Transactions
        id: 'springboot-transactions',
        name: 'Spring Transactions',
        topics: [
            springBootTransactionManagement,
            springTransactionalTransactions,
            springTransactionPropagation,
            springRequired,
            springRequiresNew,
            springSupports,
            springNotSupported,
            springMandatory,
            springNever,
            springNested,
            springTransactionIsolation,
            springReadUncommitted,
            springReadCommitted,
            springRepeatableRead,
            springSerializable,
            springRollbackRules,
            springTransactionBoundary,
            springDistributedTransactions,
        ]
    },
    {
        // 13. Logging
        id: 'springboot-logging',
        name: 'Logging',
        topics: [
            springBootLogging,
            springSlf4j,
            springLogback,
            springLogLevels,
            springDebug,
            springInfo,
            springWarn,
            springError,
            springStructuredLogging,
            springRequestResponseLogging,
            springCorrelationId,
            springMdc,
            springProductionLogging,
            springLogRotation,
        ]
    },
    {
        // 14. Testing
        id: 'springboot-testing',
        name: 'Testing',
        topics: [
            springBootUnitTesting,
            springBootIntegrationTesting,
            springJunit5,
            springMockito,
            springMocking,
            springMock,
            springInjectmocks,
            springMockbean,
            springBootTesting,
            springWebmvctest,
            springDatajpatest,
            springControllerTesting,
            springServiceTesting,
            springRepositoryTesting,
            springRestApiTesting,
            springMockmvc,
            springTestcontainers,
            springIntegrationTestDatabase,
            springTestCoverage,
        ]
    },
    {
        // 15. Actuator & Monitoring
        id: 'springboot-actuator',
        name: 'Actuator & Monitoring',
        topics: [
            springBootActuator,
            springHealthCheck,
            springMetrics,
            springActuatorHealth,
            springActuatorInfo,
            springActuatorMetrics,
            springActuatorPrometheus,
            springCustomActuatorEndpoint,
            springApplicationMonitoring,
            springJvmMonitoring,
            springMemoryMonitoring,
            springThreadMonitoring,
            springDatabaseMonitoring,
        ]
    },
    {
        // 16. Microservices
        id: 'springboot-microservices',
        name: 'Microservices',
        topics: [
            springMonolithicArchitecture,
            springBootMicroservicesIntro,
            springMicroserviceDesign,
            springServiceDecomposition,
            springApiGateway,
            springServiceDiscovery,
            springLoadBalancing,
            springInterServiceCommunication,
            springRestCommunication,
            springOpenfeign,
            springBootServiceCommunication,
            springRestclient,
            springServiceRegistry,
            springBootEurekaRegistry,
            springConfigServer,
            springCentralizedConfiguration,
            springDistributedTracing,
            springCircuitBreaker,
            springRetry,
            springTimeout,
            springRateLimiting,
            springFaultTolerance,
        ]
    },
    {
        // 17. Spring Cloud
        id: 'springboot-cloud',
        name: 'Spring Cloud',
        topics: [
            springCloudIntroduction,
            springCloudConfig,
            springEureka,
            springCloudGateway,
            springOpenfeignCloud,
            springCircuitBreakerCloud,
            springResilience4j,
            springLoadBalancingCloud,
            springDistributedTracingCloud,
            springMicrometer,
            springServiceToServiceCommunication,
            springApiGatewaySecurity,
        ]
    },
    {
        // 18. Kafka & Event-Driven Architecture
        id: 'springboot-kafka',
        name: 'Kafka & Event-Driven Architecture',
        topics: [
            springBootKafka,
            springProducer,
            springConsumer,
            springTopic,
            springPartition,
            springOffset,
            springConsumerGroup,
            springKafkaConfiguration,
            springKafkaProducerInSpringBoot,
            springKafkaConsumerInSpringBoot,
            springJsonSerialization,
            springErrorHandling,
            springRetryKafka,
            springDeadLetterTopic,
            springKafkaTransactions,
            springEventDrivenArchitecture,
            springEventualConsistency,
            springSagaPattern,
            springOutboxPattern,
        ]
    },
    {
        // 19. Messaging
        id: 'springboot-messaging',
        name: 'Messaging',
        topics: [
            springRabbitmq,
            springMessageQueue,
            springExchange,
            springQueue,
            springRoutingKey,
            springBinding,
            springProducerConsumer,
            springAmqp,
            springMessageRetry,
            springDeadLetterQueue,
        ]
    },
    {
        // 20. Caching
        id: 'springboot-caching',
        name: 'Caching',
        topics: [
            springCachingConcepts,
            springBootCaching,
            springCacheable,
            springCacheput,
            springCacheevict,
            springRedis,
            springRedisIntegration,
            springRedisCache,
            springCacheTtl,
            springCacheInvalidation,
            springDistributedCache,
        ]
    },
    {
        // 21. Scheduling & Async
        id: 'springboot-scheduling',
        name: 'Scheduling & Async',
        topics: [
            springBootSchedulingAsync,
            springScheduled,
            springCronExpressions,
            springFixedRate,
            springFixedDelay,
            springAsyncProcessing,
            springAsync,
            springExecutorservice,
            springThreadPool,
            springCompletablefuture,
            springBackgroundProcessing,
            springBootBatch,
        ]
    },
    {
        // 22. File Handling
        id: 'springboot-files',
        name: 'File Handling',
        topics: [
            springBootFileUploadDownload,
            springMultipartFile,
            springFileDownload,
            springLargeFileUpload,
            springFileStorage,
            springLocalFileStorage,
            springAwsS3,
            springCloudFileStorage,
            springFileValidation,
            springFileMetadata,
            springBootCsvImportExport,
            springBootExcelExport,
            springBootPdfExport,
        ]
    },
    {
        // 23. Email & Notifications
        id: 'springboot-email',
        name: 'Email & Notifications',
        topics: [
            springBootMailSending,
            springMail,
            springSmtp,
            springHtmlEmail,
            springEmailTemplates,
            springOtpEmail,
            springNotificationService,
            springBootSmsOtp,
            springPushNotifications,
        ]
    },
    {
        // 24. API Documentation
        id: 'springboot-docs',
        name: 'API Documentation',
        topics: [
            springBootSwagger,
            springOpenapi,
            springdocOpenapi,
            springApiDocumentation,
            springApiTags,
            springApiSchemas,
            springApiSecurityDocumentation,
            springSwaggerUi,
        ]
    },
    {
        // 25. Performance Optimization
        id: 'springboot-performance',
        name: 'Performance Optimization',
        topics: [
            springBootPerformance,
            springJvmPerformance,
            springDatabaseOptimization,
            springQueryOptimizationPerformance,
            springConnectionPoolOptimization,
            springLazyVsEagerLoading,
            springCaching,
            springPaginationPerformance,
            springAsyncProcessingPerformance,
            springThreadPoolOptimization,
            springApiResponseOptimization,
            springMemoryOptimization,
            springGarbageCollectionBasics,
            springLoadTesting,
            springStressTesting,
        ]
    },
    {
        // 26. Design Patterns with Spring Boot
        id: 'springboot-patterns',
        name: 'Design Patterns with Spring Boot',
        topics: [
            springSingleton,
            springFactory,
            springAbstractFactory,
            springBuilder,
            springStrategy,
            springObserver,
            springAdapter,
            springDecorator,
            springProxy,
            springTemplateMethod,
            springChainOfResponsibility,
            springSpecificationPattern,
            springRepositoryPattern,
            springDependencyInjectionPattern,
        ]
    },
    {
        // 27. Architecture & Clean Code
        id: 'springboot-architecture',
        name: 'Architecture & Clean Code',
        topics: [
            springLayeredArchitecture,
            springMvcArchitecture,
            springCleanArchitecture,
            springHexagonalArchitecture,
            springOnionArchitecture,
            springSolidPrinciples,
            springDry,
            springKiss,
            springYagni,
            springSeparationOfConcernsArchitecture,
            springDependencyInversion,
            springDomainDrivenDesign,
            springBoundedContext,
            springAggregate,
            springDomainService,
            springApplicationService,
        ]
    },
    {
        // 28. Production-Grade Spring Boot
        id: 'springboot-production',
        name: 'Production-Grade Spring Boot',
        topics: [
            springProductionConfiguration,
            springEnvironmentManagement,
            springSecretsManagement,
            springDatabaseSecurity,
            springApiSecurityProduction,
            springRateLimitingProduction,
            springAuditLogging,
            springMonitoring,
            springAlerting,
            springHealthChecks,
            springGracefulShutdown,
            springErrorTracking,
            springDistributedTracingProduction,
            springPerformanceMonitoring,
            springProductionDeployment,
        ]
    },
    {
        // 29. DevOps & Deployment
        id: 'springboot-devops',
        name: 'DevOps & Deployment',
        topics: [
            springGit,
            springGithubGitlab,
            springBootExecutableJar,
            springCiCd,
            springJenkins,
            springGithubActions,
            springBootDocker,
            springDockerfile,
            springDockerCompose,
            springKubernetes,
            springKubernetesDeployment,
            springKubernetesService,
            springConfigmap,
            springSecret,
            springIngress,
            springAwsDeployment,
            springAzureDeployment,
            springGcpDeployment,
            springLinuxServerDeployment,
        ]
    },
    {
        // 30. Advanced Enterprise Topics
        id: 'springboot-enterprise',
        name: 'Advanced Enterprise Topics',
        topics: [
            springDistributedSystems,
            springDistributedTransactionsEnterprise,
            springSagaPatternEnterprise,
            springCqrs,
            springEventSourcing,
            springIdempotency,
            springDistributedLock,
            springLeaderElection,
            springOutboxPatternEnterprise,
            springRetryPattern,
            springCircuitBreakerPattern,
            springBulkheadPattern,
            springRateLimiterPattern,
            springTimeoutPattern,
            springCompensationPattern,
            springEventualConsistencyEnterprise,
            springCapTheorem,
            springConsistencyModels,
            springScalability,
            springHighAvailability,
            springFaultToleranceEnterprise,
        ]
    },
];
