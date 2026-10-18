// The Spring MVC syllabus: 35 modules, 443 numbered topics.
//
// Topics that were already written keep their own file and are wired into the slot the
// syllabus gives them; the rest are stubs carrying an id, a name and a short placeholder,
// and get their content filled in one at a time. Nothing here is hand-edited - module and
// topic order follow the syllabus numbering exactly.

import type { SubTopic } from './types';

import { introductionToSpringMvc } from './topics/IntroductionToSpringMvc';
import { springMvcMvcArchitecture } from './topics/SpringMvcMvcArchitecture';
import { springMvcModel } from './topics/SpringMvcModel';
import { springMvcView } from './topics/SpringMvcView';
import { springMvcController } from './topics/SpringMvcController';
import { springMvcSpringMvcArchitectureFlow } from './topics/SpringMvcSpringMvcArchitectureFlow';
import { springMvcSpringMvcVsSpringBoot } from './topics/SpringMvcSpringMvcVsSpringBoot';
import { springMvcSpringMvcVsSpringFramework } from './topics/SpringMvcSpringMvcVsSpringFramework';
import { springMvcAdvantagesOfSpringMvc } from './topics/SpringMvcAdvantagesOfSpringMvc';
import { springMvcRequestResponseLifecycle } from './topics/SpringMvcRequestResponseLifecycle';
import { springMvcFrontControllerPattern } from './topics/SpringMvcFrontControllerPattern';
import { springMvcDispatcherservlet } from './topics/SpringMvcDispatcherservlet';
import { springMvcWhatIsDispatcherservlet } from './topics/SpringMvcWhatIsDispatcherservlet';
import { springMvcDispatcherservletArchitecture } from './topics/SpringMvcDispatcherservletArchitecture';
import { springMvcDispatcherservletInitialization } from './topics/SpringMvcDispatcherservletInitialization';
import { springMvcDispatcherservletRequestFlow } from './topics/SpringMvcDispatcherservletRequestFlow';
import { springMvcHandlermapping } from './topics/SpringMvcHandlermapping';
import { springMvcHandleradapter } from './topics/SpringMvcHandleradapter';
import { springMvcHandlerexceptionresolver } from './topics/SpringMvcHandlerexceptionresolver';
import { springMvcViewresolver } from './topics/SpringMvcViewresolver';
import { springMvcViewDispatcher } from './topics/SpringMvcViewDispatcher';
import { springMvcModelDispatcher } from './topics/SpringMvcModelDispatcher';
import { springMvcModelandview } from './topics/SpringMvcModelandview';
import { springMvcRequestProcessingPipeline } from './topics/SpringMvcRequestProcessingPipeline';
import { springMvcXmlBasedConfiguration } from './topics/SpringMvcXmlBasedConfiguration';
import { springMvcJavaBasedConfiguration } from './topics/SpringMvcJavaBasedConfiguration';
import { springMvcConfiguration } from './topics/SpringMvcConfiguration';
import { springMvcEnablewebmvc } from './topics/SpringMvcEnablewebmvc';
import { springMvcWebmvcconfigurer } from './topics/SpringMvcWebmvcconfigurer';
import { springMvcComponentScanning } from './topics/SpringMvcComponentScanning';
import { springMvcMvcConfiguration } from './topics/SpringMvcMvcConfiguration';
import { springMvcStaticResourceConfiguration } from './topics/SpringMvcStaticResourceConfiguration';
import { springMvcMessageConverterConfiguration } from './topics/SpringMvcMessageConverterConfiguration';
import { springMvcFormatterConfiguration } from './topics/SpringMvcFormatterConfiguration';
import { springMvcInterceptorConfiguration } from './topics/SpringMvcInterceptorConfiguration';
import { springMvcViewResolverConfiguration } from './topics/SpringMvcViewResolverConfiguration';
import { springMvcControllerControllers } from './topics/SpringMvcControllerControllers';
import { springMvcRestcontroller } from './topics/SpringMvcRestcontroller';
import { springMvcControllerLifecycle } from './topics/SpringMvcControllerLifecycle';
import { springMvcControllerMethods } from './topics/SpringMvcControllerMethods';
import { springMvcRequestMapping } from './topics/SpringMvcRequestMapping';
import { springMvcRequestmappingControllers } from './topics/SpringMvcRequestmappingControllers';
import { springMvcGetmapping } from './topics/SpringMvcGetmapping';
import { springMvcPostmapping } from './topics/SpringMvcPostmapping';
import { springMvcPutmapping } from './topics/SpringMvcPutmapping';
import { springMvcDeletemapping } from './topics/SpringMvcDeletemapping';
import { springMvcPatchmapping } from './topics/SpringMvcPatchmapping';
import { springMvcMappingHttpMethods } from './topics/SpringMvcMappingHttpMethods';
import { springMvcMappingUrlPaths } from './topics/SpringMvcMappingUrlPaths';
import { springMvcClassLevelMapping } from './topics/SpringMvcClassLevelMapping';
import { springMvcMethodLevelMapping } from './topics/SpringMvcMethodLevelMapping';
import { springMvcMultipleUrlMappings } from './topics/SpringMvcMultipleUrlMappings';
import { springMvcConsumes } from './topics/SpringMvcConsumes';
import { springMvcProduces } from './topics/SpringMvcProduces';
import { springMvcHttpRequest } from './topics/SpringMvcHttpRequest';
import { springMvcHttpResponse } from './topics/SpringMvcHttpResponse';
import { springMvcRequestParameters } from './topics/SpringMvcRequestParameters';
import { springMvcRequestparam } from './topics/SpringMvcRequestparam';
import { springMvcPathVariables } from './topics/SpringMvcPathVariables';
import { springMvcPathvariable } from './topics/SpringMvcPathvariable';
import { springMvcRequestHeaders } from './topics/SpringMvcRequestHeaders';
import { springMvcRequestheader } from './topics/SpringMvcRequestheader';
import { springMvcCookies } from './topics/SpringMvcCookies';
import { springMvcCookievalue } from './topics/SpringMvcCookievalue';
import { springMvcRequestBody } from './topics/SpringMvcRequestBody';
import { springMvcRequestbodyRequest } from './topics/SpringMvcRequestbodyRequest';
import { springMvcHttpservletrequest } from './topics/SpringMvcHttpservletrequest';
import { springMvcHttpservletresponse } from './topics/SpringMvcHttpservletresponse';
import { springMvcHttpsession } from './topics/SpringMvcHttpsession';
import { springMvcPrincipal } from './topics/SpringMvcPrincipal';
import { springMvcLocale } from './topics/SpringMvcLocale';
import { springMvcRequestAttributes } from './topics/SpringMvcRequestAttributes';
import { springMvcModelModelview } from './topics/SpringMvcModelModelview';
import { springMvcModelmap } from './topics/SpringMvcModelmap';
import { springMvcModelandviewModelview } from './topics/SpringMvcModelandviewModelview';
import { springMvcAddingDataToModel } from './topics/SpringMvcAddingDataToModel';
import { springMvcReadingModelData } from './topics/SpringMvcReadingModelData';
import { springMvcReturningViewName } from './topics/SpringMvcReturningViewName';
import { springMvcReturningModelandview } from './topics/SpringMvcReturningModelandview';
import { springMvcViewRendering } from './topics/SpringMvcViewRendering';
import { springMvcViewResolution } from './topics/SpringMvcViewResolution';
import { springMvcViewresolverModelview } from './topics/SpringMvcViewresolverModelview';
import { springMvcInternalresourceviewresolver } from './topics/SpringMvcInternalresourceviewresolver';
import { springMvcRedirect } from './topics/SpringMvcRedirect';
import { springMvcForward } from './topics/SpringMvcForward';
import { springMvcRedirectModelview } from './topics/SpringMvcRedirectModelview';
import { springMvcForwardModelview } from './topics/SpringMvcForwardModelview';
import { springMvcJsp } from './topics/SpringMvcJsp';
import { springMvcJstl } from './topics/SpringMvcJstl';
import { springMvcThymeleaf } from './topics/SpringMvcThymeleaf';
import { springMvcFreemarker } from './topics/SpringMvcFreemarker';
import { springMvcMustache } from './topics/SpringMvcMustache';
import { springMvcHtmlTemplates } from './topics/SpringMvcHtmlTemplates';
import { springMvcStaticHtml } from './topics/SpringMvcStaticHtml';
import { springMvcTemplateResolution } from './topics/SpringMvcTemplateResolution';
import { springMvcLayouts } from './topics/SpringMvcLayouts';
import { springMvcFormBinding } from './topics/SpringMvcFormBinding';
import { springMvcServerSideRendering } from './topics/SpringMvcServerSideRendering';
import { springMvcHtmlForms } from './topics/SpringMvcHtmlForms';
import { springMvcSpringMvcForms } from './topics/SpringMvcSpringMvcForms';
import { springMvcFormSubmission } from './topics/SpringMvcFormSubmission';
import { springMvcFormDataBinding } from './topics/SpringMvcFormDataBinding';
import { springMvcModelattribute } from './topics/SpringMvcModelattribute';
import { springMvcCommandObjects } from './topics/SpringMvcCommandObjects';
import { springMvcFormDto } from './topics/SpringMvcFormDto';
import { springMvcBindingresult } from './topics/SpringMvcBindingresult';
import { springMvcFormValidation } from './topics/SpringMvcFormValidation';
import { springMvcGetForm } from './topics/SpringMvcGetForm';
import { springMvcPostForm } from './topics/SpringMvcPostForm';
import { springMvcFormErrorHandling } from './topics/SpringMvcFormErrorHandling';
import { springMvcRedirectAfterPost } from './topics/SpringMvcRedirectAfterPost';
import { springMvcPrgPatternPostRedirectGet } from './topics/SpringMvcPrgPatternPostRedirectGet';
import { springMvcDataBinding } from './topics/SpringMvcDataBinding';
import { springMvcPropertyBinding } from './topics/SpringMvcPropertyBinding';
import { springMvcAutomaticBinding } from './topics/SpringMvcAutomaticBinding';
import { springMvcCustomDataBinding } from './topics/SpringMvcCustomDataBinding';
import { springMvcWebdatabinder } from './topics/SpringMvcWebdatabinder';
import { springMvcInitbinder } from './topics/SpringMvcInitbinder';
import { springMvcPropertyEditors } from './topics/SpringMvcPropertyEditors';
import { springMvcConverters } from './topics/SpringMvcConverters';
import { springMvcFormatters } from './topics/SpringMvcFormatters';
import { springMvcCustomFormatter } from './topics/SpringMvcCustomFormatter';
import { springMvcCustomConverter } from './topics/SpringMvcCustomConverter';
import { springMvcTypeConversion } from './topics/SpringMvcTypeConversion';
import { springMvcSpringValidation } from './topics/SpringMvcSpringValidation';
import { springMvcBeanValidation } from './topics/SpringMvcBeanValidation';
import { springMvcJakartaValidation } from './topics/SpringMvcJakartaValidation';
import { springMvcValid } from './topics/SpringMvcValid';
import { springMvcValidated } from './topics/SpringMvcValidated';
import { springMvcBindingresultValidation } from './topics/SpringMvcBindingresultValidation';
import { springMvcValidator } from './topics/SpringMvcValidator';
import { springMvcCustomValidator } from './topics/SpringMvcCustomValidator';
import { springMvcErrors } from './topics/SpringMvcErrors';
import { springMvcFielderror } from './topics/SpringMvcFielderror';
import { springMvcObjecterror } from './topics/SpringMvcObjecterror';
import { springMvcValidationMessages } from './topics/SpringMvcValidationMessages';
import { springMvcValidationGroups } from './topics/SpringMvcValidationGroups';
import { springMvcFormValidationValidation } from './topics/SpringMvcFormValidationValidation';
import { springMvcRestRequestValidation } from './topics/SpringMvcRestRequestValidation';
import { springMvcExceptionHandlingInSpringMvc } from './topics/SpringMvcExceptionHandlingInSpringMvc';
import { springMvcExceptionhandler } from './topics/SpringMvcExceptionhandler';
import { springMvcControlleradvice } from './topics/SpringMvcControlleradvice';
import { springMvcRestcontrolleradvice } from './topics/SpringMvcRestcontrolleradvice';
import { springMvcGlobalExceptionHandling } from './topics/SpringMvcGlobalExceptionHandling';
import { springMvcHandlerexceptionresolverExceptions } from './topics/SpringMvcHandlerexceptionresolverExceptions';
import { springMvcCustomErrorPages } from './topics/SpringMvcCustomErrorPages';
import { springMvcHttpErrorResponses } from './topics/SpringMvcHttpErrorResponses';
import { springMvcCustomErrorResponse } from './topics/SpringMvcCustomErrorResponse';
import { springMvcValidationExceptions } from './topics/SpringMvcValidationExceptions';
import { springMvcBusinessExceptions } from './topics/SpringMvcBusinessExceptions';
import { springMvcRestArchitecture } from './topics/SpringMvcRestArchitecture';
import { springMvcRestfulApiDesign } from './topics/SpringMvcRestfulApiDesign';
import { springMvcRestControllerRest } from './topics/SpringMvcRestControllerRest';
import { springMvcRestcontrollerRest154 } from './topics/SpringMvcRestcontrollerRest154';
import { springMvcJsonRequest } from './topics/SpringMvcJsonRequest';
import { springMvcJsonResponse } from './topics/SpringMvcJsonResponse';
import { springMvcJackson } from './topics/SpringMvcJackson';
import { springMvcObjectmapper } from './topics/SpringMvcObjectmapper';
import { springMvcJsonSerialization } from './topics/SpringMvcJsonSerialization';
import { springMvcJsonDeserialization } from './topics/SpringMvcJsonDeserialization';
import { springMvcHttpmessageconverter } from './topics/SpringMvcHttpmessageconverter';
import { springMvcMappingjackson2httpmessageconverter } from './topics/SpringMvcMappingjackson2httpmessageconverter';
import { springMvcResponseentity } from './topics/SpringMvcResponseentity';
import { springMvcHttpStatusCodes } from './topics/SpringMvcHttpStatusCodes';
import { springMvcApiVersioning } from './topics/SpringMvcApiVersioning';
import { springMvcRestApiBestPractices } from './topics/SpringMvcRestApiBestPractices';
import { springMvcWhatIsHttpmessageconverter } from './topics/SpringMvcWhatIsHttpmessageconverter';
import { springMvcJsonConverter } from './topics/SpringMvcJsonConverter';
import { springMvcXmlConverter } from './topics/SpringMvcXmlConverter';
import { springMvcStringConverter } from './topics/SpringMvcStringConverter';
import { springMvcByteArrayConverter } from './topics/SpringMvcByteArrayConverter';
import { springMvcFormConverter } from './topics/SpringMvcFormConverter';
import { springMvcJacksonIntegration } from './topics/SpringMvcJacksonIntegration';
import { springMvcCustomMessageConverter } from './topics/SpringMvcCustomMessageConverter';
import { springMvcContentNegotiation } from './topics/SpringMvcContentNegotiation';
import { springMvcAcceptHeader } from './topics/SpringMvcAcceptHeader';
import { springMvcContentTypeHeader } from './topics/SpringMvcContentTypeHeader';
import { springMvcSpringMvcInterceptors } from './topics/SpringMvcSpringMvcInterceptors';
import { springMvcHandlerinterceptor } from './topics/SpringMvcHandlerinterceptor';
import { springMvcPrehandle } from './topics/SpringMvcPrehandle';
import { springMvcPosthandle } from './topics/SpringMvcPosthandle';
import { springMvcAftercompletion } from './topics/SpringMvcAftercompletion';
import { springMvcInterceptorRegistration } from './topics/SpringMvcInterceptorRegistration';
import { springMvcMultipleInterceptors } from './topics/SpringMvcMultipleInterceptors';
import { springMvcLoggingInterceptor } from './topics/SpringMvcLoggingInterceptor';
import { springMvcAuthenticationInterceptor } from './topics/SpringMvcAuthenticationInterceptor';
import { springMvcAuthorizationInterceptor } from './topics/SpringMvcAuthorizationInterceptor';
import { springMvcRequestTracking } from './topics/SpringMvcRequestTracking';
import { springMvcPerformanceMonitoring } from './topics/SpringMvcPerformanceMonitoring';
import { springMvcServletFilter } from './topics/SpringMvcServletFilter';
import { springMvcFilterVsInterceptor } from './topics/SpringMvcFilterVsInterceptor';
import { springMvcFilter } from './topics/SpringMvcFilter';
import { springMvcOnceperrequestfilter } from './topics/SpringMvcOnceperrequestfilter';
import { springMvcRequestLoggingFilter } from './topics/SpringMvcRequestLoggingFilter';
import { springMvcAuthenticationFilter } from './topics/SpringMvcAuthenticationFilter';
import { springMvcCorsFilter } from './topics/SpringMvcCorsFilter';
import { springMvcCharacterEncodingFilter } from './topics/SpringMvcCharacterEncodingFilter';
import { springMvcFilterChain } from './topics/SpringMvcFilterChain';
import { springMvcFilterOrdering } from './topics/SpringMvcFilterOrdering';
import { springMvcServletBasics } from './topics/SpringMvcServletBasics';
import { springMvcServletLifecycle } from './topics/SpringMvcServletLifecycle';
import { springMvcServletContainer } from './topics/SpringMvcServletContainer';
import { springMvcTomcat } from './topics/SpringMvcTomcat';
import { springMvcHttpservletrequestServlet } from './topics/SpringMvcHttpservletrequestServlet';
import { springMvcHttpservletresponseServlet } from './topics/SpringMvcHttpservletresponseServlet';
import { springMvcHttpsessionServlet } from './topics/SpringMvcHttpsessionServlet';
import { springMvcServletcontext } from './topics/SpringMvcServletcontext';
import { springMvcServletconfig } from './topics/SpringMvcServletconfig';
import { springMvcFilterServlet } from './topics/SpringMvcFilterServlet';
import { springMvcListener } from './topics/SpringMvcListener';
import { springMvcDispatcherservletAndServletContainer } from './topics/SpringMvcDispatcherservletAndServletContainer';
import { springMvcHttpSessionSession } from './topics/SpringMvcHttpSessionSession';
import { springMvcHttpsessionSession213 } from './topics/SpringMvcHttpsessionSession213';
import { springMvcSessionAttributes } from './topics/SpringMvcSessionAttributes';
import { springMvcSessionTimeout } from './topics/SpringMvcSessionTimeout';
import { springMvcCookieBasedSession } from './topics/SpringMvcCookieBasedSession';
import { springMvcUrlRewriting } from './topics/SpringMvcUrlRewriting';
import { springMvcSessionManagement } from './topics/SpringMvcSessionManagement';
import { springMvcStatelessVsStatefulApplication } from './topics/SpringMvcStatelessVsStatefulApplication';
import { springMvcHttpCookies } from './topics/SpringMvcHttpCookies';
import { springMvcCreatingCookies } from './topics/SpringMvcCreatingCookies';
import { springMvcReadingCookies } from './topics/SpringMvcReadingCookies';
import { springMvcUpdatingCookies } from './topics/SpringMvcUpdatingCookies';
import { springMvcDeletingCookies } from './topics/SpringMvcDeletingCookies';
import { springMvcSecureCookies } from './topics/SpringMvcSecureCookies';
import { springMvcHttponly } from './topics/SpringMvcHttponly';
import { springMvcSamesite } from './topics/SpringMvcSamesite';
import { springMvcCookieBasedAuthentication } from './topics/SpringMvcCookieBasedAuthentication';
import { springMvcMultipartRequest } from './topics/SpringMvcMultipartRequest';
import { springMvcMultipartfile } from './topics/SpringMvcMultipartfile';
import { springMvcFileUpload } from './topics/SpringMvcFileUpload';
import { springMvcMultipleFileUpload } from './topics/SpringMvcMultipleFileUpload';
import { springMvcFileValidation } from './topics/SpringMvcFileValidation';
import { springMvcFileSizeValidation } from './topics/SpringMvcFileSizeValidation';
import { springMvcFileTypeValidation } from './topics/SpringMvcFileTypeValidation';
import { springMvcFileDownload } from './topics/SpringMvcFileDownload';
import { springMvcStreamingResponse } from './topics/SpringMvcStreamingResponse';
import { springMvcResource } from './topics/SpringMvcResource';
import { springMvcResponseentityResource } from './topics/SpringMvcResponseentityResource';
import { springMvcLargeFileHandling } from './topics/SpringMvcLargeFileHandling';
import { springMvcInternationalizationI18n } from './topics/SpringMvcInternationalizationI18n';
import { springMvcLocalizationL10n } from './topics/SpringMvcLocalizationL10n';
import { springMvcLocaleI18n } from './topics/SpringMvcLocaleI18n';
import { springMvcLocaleresolver } from './topics/SpringMvcLocaleresolver';
import { springMvcLocalechangeinterceptor } from './topics/SpringMvcLocalechangeinterceptor';
import { springMvcMessagesource } from './topics/SpringMvcMessagesource';
import { springMvcResourcebundlemessagesource } from './topics/SpringMvcResourcebundlemessagesource';
import { springMvcLanguageProperties } from './topics/SpringMvcLanguageProperties';
import { springMvcMultiLanguageApplications } from './topics/SpringMvcMultiLanguageApplications';
import { springMvcDynamicLanguageSwitching } from './topics/SpringMvcDynamicLanguageSwitching';
import { springMvcSpringMvcThemes } from './topics/SpringMvcSpringMvcThemes';
import { springMvcThemeresolver } from './topics/SpringMvcThemeresolver';
import { springMvcThemesource } from './topics/SpringMvcThemesource';
import { springMvcThemeConfiguration } from './topics/SpringMvcThemeConfiguration';
import { springMvcDynamicThemes } from './topics/SpringMvcDynamicThemes';
import { springMvcContentNegotiationNegotiation } from './topics/SpringMvcContentNegotiationNegotiation';
import { springMvcJsonVsXml } from './topics/SpringMvcJsonVsXml';
import { springMvcAcceptHeaderNegotiation } from './topics/SpringMvcAcceptHeaderNegotiation';
import { springMvcContentType } from './topics/SpringMvcContentType';
import { springMvcUrlBasedContentNegotiation } from './topics/SpringMvcUrlBasedContentNegotiation';
import { springMvcParameterBasedContentNegotiation } from './topics/SpringMvcParameterBasedContentNegotiation';
import { springMvcHeaderBasedContentNegotiation } from './topics/SpringMvcHeaderBasedContentNegotiation';
import { springMvcCustomContentNegotiation } from './topics/SpringMvcCustomContentNegotiation';
import { springMvcWhatIsCors } from './topics/SpringMvcWhatIsCors';
import { springMvcSameOriginPolicy } from './topics/SpringMvcSameOriginPolicy';
import { springMvcCrossOriginRequests } from './topics/SpringMvcCrossOriginRequests';
import { springMvcCrossorigin } from './topics/SpringMvcCrossorigin';
import { springMvcGlobalCorsConfiguration } from './topics/SpringMvcGlobalCorsConfiguration';
import { springMvcCorsFilterCors } from './topics/SpringMvcCorsFilterCors';
import { springMvcPreflightRequest } from './topics/SpringMvcPreflightRequest';
import { springMvcOptionsRequest } from './topics/SpringMvcOptionsRequest';
import { springMvcCorsSecurity } from './topics/SpringMvcCorsSecurity';
import { springMvcSpringSecurityIntegration } from './topics/SpringMvcSpringSecurityIntegration';
import { springMvcAuthentication } from './topics/SpringMvcAuthentication';
import { springMvcAuthorization } from './topics/SpringMvcAuthorization';
import { springMvcLogin } from './topics/SpringMvcLogin';
import { springMvcLogout } from './topics/SpringMvcLogout';
import { springMvcFormLogin } from './topics/SpringMvcFormLogin';
import { springMvcBasicAuthentication } from './topics/SpringMvcBasicAuthentication';
import { springMvcSessionAuthentication } from './topics/SpringMvcSessionAuthentication';
import { springMvcSecurityFilters } from './topics/SpringMvcSecurityFilters';
import { springMvcCsrf } from './topics/SpringMvcCsrf';
import { springMvcCorsPlusSecurity } from './topics/SpringMvcCorsPlusSecurity';
import { springMvcRoleBasedAuthorization } from './topics/SpringMvcRoleBasedAuthorization';
import { springMvcMethodLevelSecurity } from './topics/SpringMvcMethodLevelSecurity';
import { springMvcSecurityContext } from './topics/SpringMvcSecurityContext';
import { springMvcPrincipalSecurity } from './topics/SpringMvcPrincipalSecurity';
import { springMvcMvcPlusJdbc } from './topics/SpringMvcMvcPlusJdbc';
import { springMvcMvcPlusJpa } from './topics/SpringMvcMvcPlusJpa';
import { springMvcMvcPlusHibernate } from './topics/SpringMvcMvcPlusHibernate';
import { springMvcRepositoryLayer } from './topics/SpringMvcRepositoryLayer';
import { springMvcServiceLayer } from './topics/SpringMvcServiceLayer';
import { springMvcControllerLayer } from './topics/SpringMvcControllerLayer';
import { springMvcDaoPattern } from './topics/SpringMvcDaoPattern';
import { springMvcDtoPattern } from './topics/SpringMvcDtoPattern';
import { springMvcEntityMapping } from './topics/SpringMvcEntityMapping';
import { springMvcTransactionManagement } from './topics/SpringMvcTransactionManagement';
import { springMvcDatabaseExceptionHandling } from './topics/SpringMvcDatabaseExceptionHandling';
import { springMvcControllerLayerLayers } from './topics/SpringMvcControllerLayerLayers';
import { springMvcServiceLayerLayers } from './topics/SpringMvcServiceLayerLayers';
import { springMvcRepositoryLayerLayers } from './topics/SpringMvcRepositoryLayerLayers';
import { springMvcDaoLayer } from './topics/SpringMvcDaoLayer';
import { springMvcEntityLayer } from './topics/SpringMvcEntityLayer';
import { springMvcDtoLayer } from './topics/SpringMvcDtoLayer';
import { springMvcMapperLayer } from './topics/SpringMvcMapperLayer';
import { springMvcUtilityLayer } from './topics/SpringMvcUtilityLayer';
import { springMvcConfigurationLayer } from './topics/SpringMvcConfigurationLayer';
import { springMvcExceptionLayer } from './topics/SpringMvcExceptionLayer';
import { springMvcSeparationOfConcerns } from './topics/SpringMvcSeparationOfConcerns';
import { springMvcAjax } from './topics/SpringMvcAjax';
import { springMvcSpringMvcAjaxRequests } from './topics/SpringMvcSpringMvcAjaxRequests';
import { springMvcJsonAjax } from './topics/SpringMvcJsonAjax';
import { springMvcFetchApi } from './topics/SpringMvcFetchApi';
import { springMvcJqueryAjax } from './topics/SpringMvcJqueryAjax';
import { springMvcAsynchronousFormSubmission } from './topics/SpringMvcAsynchronousFormSubmission';
import { springMvcDynamicPageUpdates } from './topics/SpringMvcDynamicPageUpdates';
import { springMvcRestApiIntegration } from './topics/SpringMvcRestApiIntegration';
import { springMvcThymeleafIntroduction } from './topics/SpringMvcThymeleafIntroduction';
import { springMvcThymeleafConfiguration } from './topics/SpringMvcThymeleafConfiguration';
import { springMvcTemplateResolutionThymeleaf } from './topics/SpringMvcTemplateResolutionThymeleaf';
import { springMvcThText } from './topics/SpringMvcThText';
import { springMvcThIf } from './topics/SpringMvcThIf';
import { springMvcThEach } from './topics/SpringMvcThEach';
import { springMvcThHref } from './topics/SpringMvcThHref';
import { springMvcThSrc } from './topics/SpringMvcThSrc';
import { springMvcThValue } from './topics/SpringMvcThValue';
import { springMvcThObject } from './topics/SpringMvcThObject';
import { springMvcThField } from './topics/SpringMvcThField';
import { springMvcFormBindingThymeleaf } from './topics/SpringMvcFormBindingThymeleaf';
import { springMvcThymeleafValidation } from './topics/SpringMvcThymeleafValidation';
import { springMvcThymeleafFragments } from './topics/SpringMvcThymeleafFragments';
import { springMvcLayoutsThymeleaf } from './topics/SpringMvcLayoutsThymeleaf';
import { springMvcThymeleafSecurityIntegration } from './topics/SpringMvcThymeleafSecurityIntegration';
import { springMvcUnitTesting } from './topics/SpringMvcUnitTesting';
import { springMvcControllerTesting } from './topics/SpringMvcControllerTesting';
import { springMvcServiceTesting } from './topics/SpringMvcServiceTesting';
import { springMvcIntegrationTesting } from './topics/SpringMvcIntegrationTesting';
import { springMvcJunit } from './topics/SpringMvcJunit';
import { springMvcMockito } from './topics/SpringMvcMockito';
import { springMvcMockmvc } from './topics/SpringMvcMockmvc';
import { springMvcWebmvctest } from './topics/SpringMvcWebmvctest';
import { springMvcSpringboottest } from './topics/SpringMvcSpringboottest';
import { springMvcControllerMocking } from './topics/SpringMvcControllerMocking';
import { springMvcRequestTesting } from './topics/SpringMvcRequestTesting';
import { springMvcResponseTesting } from './topics/SpringMvcResponseTesting';
import { springMvcExceptionTesting } from './topics/SpringMvcExceptionTesting';
import { springMvcValidationTesting } from './topics/SpringMvcValidationTesting';
import { springMvcSecurityTesting } from './topics/SpringMvcSecurityTesting';
import { springMvcSlf4j } from './topics/SpringMvcSlf4j';
import { springMvcLogback } from './topics/SpringMvcLogback';
import { springMvcRequestLogging } from './topics/SpringMvcRequestLogging';
import { springMvcResponseLogging } from './topics/SpringMvcResponseLogging';
import { springMvcExceptionLogging } from './topics/SpringMvcExceptionLogging';
import { springMvcCorrelationId } from './topics/SpringMvcCorrelationId';
import { springMvcMdc } from './topics/SpringMvcMdc';
import { springMvcPerformanceLogging } from './topics/SpringMvcPerformanceLogging';
import { springMvcActuatorIntegration } from './topics/SpringMvcActuatorIntegration';
import { springMvcHealthMonitoring } from './topics/SpringMvcHealthMonitoring';
import { springMvcMetrics } from './topics/SpringMvcMetrics';
import { springMvcCustomHandlermapping } from './topics/SpringMvcCustomHandlermapping';
import { springMvcCustomHandleradapter } from './topics/SpringMvcCustomHandleradapter';
import { springMvcCustomViewresolver } from './topics/SpringMvcCustomViewresolver';
import { springMvcCustomArgumentResolver } from './topics/SpringMvcCustomArgumentResolver';
import { springMvcHandlermethodargumentresolver } from './topics/SpringMvcHandlermethodargumentresolver';
import { springMvcCustomReturnValueHandler } from './topics/SpringMvcCustomReturnValueHandler';
import { springMvcHandlermethodreturnvaluehandler } from './topics/SpringMvcHandlermethodreturnvaluehandler';
import { springMvcCustomFormatterAdvanced } from './topics/SpringMvcCustomFormatterAdvanced';
import { springMvcCustomConverterAdvanced } from './topics/SpringMvcCustomConverterAdvanced';
import { springMvcCustomInterceptor } from './topics/SpringMvcCustomInterceptor';
import { springMvcCustomExceptionResolver } from './topics/SpringMvcCustomExceptionResolver';
import { springMvcCustomMessageConverterAdvanced } from './topics/SpringMvcCustomMessageConverterAdvanced';
import { springMvcCustomAnnotation } from './topics/SpringMvcCustomAnnotation';
import { springMvcRequestLifecycleCustomization } from './topics/SpringMvcRequestLifecycleCustomization';
import { springMvcFrontControllerPatternPatterns } from './topics/SpringMvcFrontControllerPatternPatterns';
import { springMvcMvcPattern } from './topics/SpringMvcMvcPattern';
import { springMvcDependencyInjection } from './topics/SpringMvcDependencyInjection';
import { springMvcIoc } from './topics/SpringMvcIoc';
import { springMvcSingleton } from './topics/SpringMvcSingleton';
import { springMvcFactoryPattern } from './topics/SpringMvcFactoryPattern';
import { springMvcStrategyPattern } from './topics/SpringMvcStrategyPattern';
import { springMvcProxyPattern } from './topics/SpringMvcProxyPattern';
import { springMvcTemplateMethodPattern } from './topics/SpringMvcTemplateMethodPattern';
import { springMvcRepositoryPattern } from './topics/SpringMvcRepositoryPattern';
import { springMvcServiceLayerPattern } from './topics/SpringMvcServiceLayerPattern';
import { springMvcDtoPatternPatterns } from './topics/SpringMvcDtoPatternPatterns';
import { springMvcDaoPatternPatterns } from './topics/SpringMvcDaoPatternPatterns';
import { springMvcPrgPattern } from './topics/SpringMvcPrgPattern';
import { springMvcMvcPerformance } from './topics/SpringMvcMvcPerformance';
import { springMvcRequestProcessingOptimization } from './topics/SpringMvcRequestProcessingOptimization';
import { springMvcDatabaseOptimization } from './topics/SpringMvcDatabaseOptimization';
import { springMvcConnectionPooling } from './topics/SpringMvcConnectionPooling';
import { springMvcCaching } from './topics/SpringMvcCaching';
import { springMvcHttpCaching } from './topics/SpringMvcHttpCaching';
import { springMvcResponseCompression } from './topics/SpringMvcResponseCompression';
import { springMvcStaticResourceOptimization } from './topics/SpringMvcStaticResourceOptimization';
import { springMvcAsyncRequestProcessing } from './topics/SpringMvcAsyncRequestProcessing';
import { springMvcCallable } from './topics/SpringMvcCallable';
import { springMvcDeferredresult } from './topics/SpringMvcDeferredresult';
import { springMvcWebasynctask } from './topics/SpringMvcWebasynctask';
import { springMvcStreamingResponsePerformance } from './topics/SpringMvcStreamingResponsePerformance';
import { springMvcThreadPoolManagement } from './topics/SpringMvcThreadPoolManagement';
import { springMvcProductionConfiguration } from './topics/SpringMvcProductionConfiguration';
import { springMvcEnvironmentProfiles } from './topics/SpringMvcEnvironmentProfiles';
import { springMvcSecurityConfiguration } from './topics/SpringMvcSecurityConfiguration';
import { springMvcCentralizedExceptionHandling } from './topics/SpringMvcCentralizedExceptionHandling';
import { springMvcApiLogging } from './topics/SpringMvcApiLogging';
import { springMvcAuditLogging } from './topics/SpringMvcAuditLogging';
import { springMvcMonitoring } from './topics/SpringMvcMonitoring';
import { springMvcHealthChecks } from './topics/SpringMvcHealthChecks';
import { springMvcPerformanceMonitoringProduction } from './topics/SpringMvcPerformanceMonitoringProduction';
import { springMvcRateLimiting } from './topics/SpringMvcRateLimiting';
import { springMvcRequestTracing } from './topics/SpringMvcRequestTracing';
import { springMvcGracefulErrorHandling } from './topics/SpringMvcGracefulErrorHandling';
import { springMvcProductionDeployment } from './topics/SpringMvcProductionDeployment';
import { springMvcLoadBalancing } from './topics/SpringMvcLoadBalancing';
import { springMvcReverseProxy } from './topics/SpringMvcReverseProxy';
import { springMvcNginxPlusSpringMvc } from './topics/SpringMvcNginxPlusSpringMvc';
import { springMvcTomcatConfiguration } from './topics/SpringMvcTomcatConfiguration';
import { springMvcSpringMvcArchitecture } from './topics/SpringMvcSpringMvcArchitecture';
import { springMvcDispatcherservletInterview } from './topics/SpringMvcDispatcherservletInterview';
import { springMvcDispatcherservletRequestFlowInterview } from './topics/SpringMvcDispatcherservletRequestFlowInterview';
import { springMvcHandlermappingInterview } from './topics/SpringMvcHandlermappingInterview';
import { springMvcHandleradapterInterview } from './topics/SpringMvcHandleradapterInterview';
import { springMvcViewresolverInterview } from './topics/SpringMvcViewresolverInterview';
import { springMvcModelVsModelmapVsModelandview } from './topics/SpringMvcModelVsModelmapVsModelandview';
import { springMvcControllerVsRestcontroller } from './topics/SpringMvcControllerVsRestcontroller';
import { springMvcRequestmappingVsGetmapping } from './topics/SpringMvcRequestmappingVsGetmapping';
import { springMvcRequestparamVsPathvariable } from './topics/SpringMvcRequestparamVsPathvariable';
import { springMvcRequestbodyVsModelattribute } from './topics/SpringMvcRequestbodyVsModelattribute';
import { springMvcFilterVsInterceptorInterview } from './topics/SpringMvcFilterVsInterceptorInterview';
import { springMvcControlleradviceVsExceptionhandler } from './topics/SpringMvcControlleradviceVsExceptionhandler';
import { springMvcValidVsValidated } from './topics/SpringMvcValidVsValidated';
import { springMvcResponseentityInterview } from './topics/SpringMvcResponseentityInterview';
import { springMvcHttpmessageconverterInterview } from './topics/SpringMvcHttpmessageconverterInterview';
import { springMvcJacksonInterview } from './topics/SpringMvcJacksonInterview';
import { springMvcContentNegotiationInterview } from './topics/SpringMvcContentNegotiationInterview';
import { springMvcCors } from './topics/SpringMvcCors';
import { springMvcCsrfInterview } from './topics/SpringMvcCsrfInterview';
import { springMvcSessionVsStateless } from './topics/SpringMvcSessionVsStateless';
import { springMvcMvcVsRest } from './topics/SpringMvcMvcVsRest';
import { springMvcSpringMvcVsSpringBootInterview } from './topics/SpringMvcSpringMvcVsSpringBootInterview';
import { springMvcSpringMvcVsSpringWebflux } from './topics/SpringMvcSpringMvcVsSpringWebflux';
import { springMvcSynchronousVsAsynchronousRequestProcessing } from './topics/SpringMvcSynchronousVsAsynchronousRequestProcessing';

export const springMvcModules: SubTopic[] = [
    {
        // 1. Spring MVC Fundamentals
        id: 'springmvc-fundamentals',
        name: 'Spring MVC Fundamentals',
        topics: [
            introductionToSpringMvc,
            springMvcMvcArchitecture,
            springMvcModel,
            springMvcView,
            springMvcController,
            springMvcSpringMvcArchitectureFlow,
            springMvcSpringMvcVsSpringBoot,
            springMvcSpringMvcVsSpringFramework,
            springMvcAdvantagesOfSpringMvc,
            springMvcRequestResponseLifecycle,
            springMvcFrontControllerPattern,
            springMvcDispatcherservlet,
        ]
    },
    {
        // 2. DispatcherServlet
        id: 'springmvc-dispatcher',
        name: 'DispatcherServlet',
        topics: [
            springMvcWhatIsDispatcherservlet,
            springMvcDispatcherservletArchitecture,
            springMvcDispatcherservletInitialization,
            springMvcDispatcherservletRequestFlow,
            springMvcHandlermapping,
            springMvcHandleradapter,
            springMvcHandlerexceptionresolver,
            springMvcViewresolver,
            springMvcViewDispatcher,
            springMvcModelDispatcher,
            springMvcModelandview,
            springMvcRequestProcessingPipeline,
        ]
    },
    {
        // 3. Spring MVC Configuration
        id: 'springmvc-configuration',
        name: 'Spring MVC Configuration',
        topics: [
            springMvcXmlBasedConfiguration,
            springMvcJavaBasedConfiguration,
            springMvcConfiguration,
            springMvcEnablewebmvc,
            springMvcWebmvcconfigurer,
            springMvcComponentScanning,
            springMvcMvcConfiguration,
            springMvcStaticResourceConfiguration,
            springMvcMessageConverterConfiguration,
            springMvcFormatterConfiguration,
            springMvcInterceptorConfiguration,
            springMvcViewResolverConfiguration,
        ]
    },
    {
        // 4. Controllers
        id: 'springmvc-controllers',
        name: 'Controllers',
        topics: [
            springMvcControllerControllers,
            springMvcRestcontroller,
            springMvcControllerLifecycle,
            springMvcControllerMethods,
            springMvcRequestMapping,
            springMvcRequestmappingControllers,
            springMvcGetmapping,
            springMvcPostmapping,
            springMvcPutmapping,
            springMvcDeletemapping,
            springMvcPatchmapping,
            springMvcMappingHttpMethods,
            springMvcMappingUrlPaths,
            springMvcClassLevelMapping,
            springMvcMethodLevelMapping,
            springMvcMultipleUrlMappings,
            springMvcConsumes,
            springMvcProduces,
        ]
    },
    {
        // 5. Request Handling
        id: 'springmvc-request',
        name: 'Request Handling',
        topics: [
            springMvcHttpRequest,
            springMvcHttpResponse,
            springMvcRequestParameters,
            springMvcRequestparam,
            springMvcPathVariables,
            springMvcPathvariable,
            springMvcRequestHeaders,
            springMvcRequestheader,
            springMvcCookies,
            springMvcCookievalue,
            springMvcRequestBody,
            springMvcRequestbodyRequest,
            springMvcHttpservletrequest,
            springMvcHttpservletresponse,
            springMvcHttpsession,
            springMvcPrincipal,
            springMvcLocale,
            springMvcRequestAttributes,
        ]
    },
    {
        // 6. Model & View
        id: 'springmvc-modelview',
        name: 'Model & View',
        topics: [
            springMvcModelModelview,
            springMvcModelmap,
            springMvcModelandviewModelview,
            springMvcAddingDataToModel,
            springMvcReadingModelData,
            springMvcReturningViewName,
            springMvcReturningModelandview,
            springMvcViewRendering,
            springMvcViewResolution,
            springMvcViewresolverModelview,
            springMvcInternalresourceviewresolver,
            springMvcRedirect,
            springMvcForward,
            springMvcRedirectModelview,
            springMvcForwardModelview,
        ]
    },
    {
        // 7. View Technologies
        id: 'springmvc-views',
        name: 'View Technologies',
        topics: [
            springMvcJsp,
            springMvcJstl,
            springMvcThymeleaf,
            springMvcFreemarker,
            springMvcMustache,
            springMvcHtmlTemplates,
            springMvcStaticHtml,
            springMvcTemplateResolution,
            springMvcLayouts,
            springMvcFormBinding,
            springMvcServerSideRendering,
        ]
    },
    {
        // 8. Form Handling
        id: 'springmvc-forms',
        name: 'Form Handling',
        topics: [
            springMvcHtmlForms,
            springMvcSpringMvcForms,
            springMvcFormSubmission,
            springMvcFormDataBinding,
            springMvcModelattribute,
            springMvcCommandObjects,
            springMvcFormDto,
            springMvcBindingresult,
            springMvcFormValidation,
            springMvcGetForm,
            springMvcPostForm,
            springMvcFormErrorHandling,
            springMvcRedirectAfterPost,
            springMvcPrgPatternPostRedirectGet,
        ]
    },
    {
        // 9. Data Binding
        id: 'springmvc-binding',
        name: 'Data Binding',
        topics: [
            springMvcDataBinding,
            springMvcPropertyBinding,
            springMvcAutomaticBinding,
            springMvcCustomDataBinding,
            springMvcWebdatabinder,
            springMvcInitbinder,
            springMvcPropertyEditors,
            springMvcConverters,
            springMvcFormatters,
            springMvcCustomFormatter,
            springMvcCustomConverter,
            springMvcTypeConversion,
        ]
    },
    {
        // 10. Validation
        id: 'springmvc-validation',
        name: 'Validation',
        topics: [
            springMvcSpringValidation,
            springMvcBeanValidation,
            springMvcJakartaValidation,
            springMvcValid,
            springMvcValidated,
            springMvcBindingresultValidation,
            springMvcValidator,
            springMvcCustomValidator,
            springMvcErrors,
            springMvcFielderror,
            springMvcObjecterror,
            springMvcValidationMessages,
            springMvcValidationGroups,
            springMvcFormValidationValidation,
            springMvcRestRequestValidation,
        ]
    },
    {
        // 11. Exception Handling
        id: 'springmvc-exceptions',
        name: 'Exception Handling',
        topics: [
            springMvcExceptionHandlingInSpringMvc,
            springMvcExceptionhandler,
            springMvcControlleradvice,
            springMvcRestcontrolleradvice,
            springMvcGlobalExceptionHandling,
            springMvcHandlerexceptionresolverExceptions,
            springMvcCustomErrorPages,
            springMvcHttpErrorResponses,
            springMvcCustomErrorResponse,
            springMvcValidationExceptions,
            springMvcBusinessExceptions,
        ]
    },
    {
        // 12. REST API with Spring MVC
        id: 'springmvc-rest',
        name: 'REST API with Spring MVC',
        topics: [
            springMvcRestArchitecture,
            springMvcRestfulApiDesign,
            springMvcRestControllerRest,
            springMvcRestcontrollerRest154,
            springMvcJsonRequest,
            springMvcJsonResponse,
            springMvcJackson,
            springMvcObjectmapper,
            springMvcJsonSerialization,
            springMvcJsonDeserialization,
            springMvcHttpmessageconverter,
            springMvcMappingjackson2httpmessageconverter,
            springMvcResponseentity,
            springMvcHttpStatusCodes,
            springMvcApiVersioning,
            springMvcRestApiBestPractices,
        ]
    },
    {
        // 13. HTTP Message Converters
        id: 'springmvc-converters',
        name: 'HTTP Message Converters',
        topics: [
            springMvcWhatIsHttpmessageconverter,
            springMvcJsonConverter,
            springMvcXmlConverter,
            springMvcStringConverter,
            springMvcByteArrayConverter,
            springMvcFormConverter,
            springMvcJacksonIntegration,
            springMvcCustomMessageConverter,
            springMvcContentNegotiation,
            springMvcAcceptHeader,
            springMvcContentTypeHeader,
        ]
    },
    {
        // 14. Interceptors
        id: 'springmvc-interceptors',
        name: 'Interceptors',
        topics: [
            springMvcSpringMvcInterceptors,
            springMvcHandlerinterceptor,
            springMvcPrehandle,
            springMvcPosthandle,
            springMvcAftercompletion,
            springMvcInterceptorRegistration,
            springMvcMultipleInterceptors,
            springMvcLoggingInterceptor,
            springMvcAuthenticationInterceptor,
            springMvcAuthorizationInterceptor,
            springMvcRequestTracking,
            springMvcPerformanceMonitoring,
        ]
    },
    {
        // 15. Filters
        id: 'springmvc-filters',
        name: 'Filters',
        topics: [
            springMvcServletFilter,
            springMvcFilterVsInterceptor,
            springMvcFilter,
            springMvcOnceperrequestfilter,
            springMvcRequestLoggingFilter,
            springMvcAuthenticationFilter,
            springMvcCorsFilter,
            springMvcCharacterEncodingFilter,
            springMvcFilterChain,
            springMvcFilterOrdering,
        ]
    },
    {
        // 16. Servlet Integration
        id: 'springmvc-servlet',
        name: 'Servlet Integration',
        topics: [
            springMvcServletBasics,
            springMvcServletLifecycle,
            springMvcServletContainer,
            springMvcTomcat,
            springMvcHttpservletrequestServlet,
            springMvcHttpservletresponseServlet,
            springMvcHttpsessionServlet,
            springMvcServletcontext,
            springMvcServletconfig,
            springMvcFilterServlet,
            springMvcListener,
            springMvcDispatcherservletAndServletContainer,
        ]
    },
    {
        // 17. Session Management
        id: 'springmvc-session',
        name: 'Session Management',
        topics: [
            springMvcHttpSessionSession,
            springMvcHttpsessionSession213,
            springMvcSessionAttributes,
            springMvcSessionTimeout,
            springMvcCookieBasedSession,
            springMvcUrlRewriting,
            springMvcSessionManagement,
            springMvcStatelessVsStatefulApplication,
        ]
    },
    {
        // 18. Cookies
        id: 'springmvc-cookies',
        name: 'Cookies',
        topics: [
            springMvcHttpCookies,
            springMvcCreatingCookies,
            springMvcReadingCookies,
            springMvcUpdatingCookies,
            springMvcDeletingCookies,
            springMvcSecureCookies,
            springMvcHttponly,
            springMvcSamesite,
            springMvcCookieBasedAuthentication,
        ]
    },
    {
        // 19. File Upload & Download
        id: 'springmvc-files',
        name: 'File Upload & Download',
        topics: [
            springMvcMultipartRequest,
            springMvcMultipartfile,
            springMvcFileUpload,
            springMvcMultipleFileUpload,
            springMvcFileValidation,
            springMvcFileSizeValidation,
            springMvcFileTypeValidation,
            springMvcFileDownload,
            springMvcStreamingResponse,
            springMvcResource,
            springMvcResponseentityResource,
            springMvcLargeFileHandling,
        ]
    },
    {
        // 20. Internationalization
        id: 'springmvc-i18n',
        name: 'Internationalization',
        topics: [
            springMvcInternationalizationI18n,
            springMvcLocalizationL10n,
            springMvcLocaleI18n,
            springMvcLocaleresolver,
            springMvcLocalechangeinterceptor,
            springMvcMessagesource,
            springMvcResourcebundlemessagesource,
            springMvcLanguageProperties,
            springMvcMultiLanguageApplications,
            springMvcDynamicLanguageSwitching,
        ]
    },
    {
        // 21. Theme Support
        id: 'springmvc-themes',
        name: 'Theme Support',
        topics: [
            springMvcSpringMvcThemes,
            springMvcThemeresolver,
            springMvcThemesource,
            springMvcThemeConfiguration,
            springMvcDynamicThemes,
        ]
    },
    {
        // 22. Content Negotiation
        id: 'springmvc-negotiation',
        name: 'Content Negotiation',
        topics: [
            springMvcContentNegotiationNegotiation,
            springMvcJsonVsXml,
            springMvcAcceptHeaderNegotiation,
            springMvcContentType,
            springMvcUrlBasedContentNegotiation,
            springMvcParameterBasedContentNegotiation,
            springMvcHeaderBasedContentNegotiation,
            springMvcCustomContentNegotiation,
        ]
    },
    {
        // 23. CORS
        id: 'springmvc-cors',
        name: 'CORS',
        topics: [
            springMvcWhatIsCors,
            springMvcSameOriginPolicy,
            springMvcCrossOriginRequests,
            springMvcCrossorigin,
            springMvcGlobalCorsConfiguration,
            springMvcCorsFilterCors,
            springMvcPreflightRequest,
            springMvcOptionsRequest,
            springMvcCorsSecurity,
        ]
    },
    {
        // 24. Spring MVC Security Integration
        id: 'springmvc-security',
        name: 'Spring MVC Security Integration',
        topics: [
            springMvcSpringSecurityIntegration,
            springMvcAuthentication,
            springMvcAuthorization,
            springMvcLogin,
            springMvcLogout,
            springMvcFormLogin,
            springMvcBasicAuthentication,
            springMvcSessionAuthentication,
            springMvcSecurityFilters,
            springMvcCsrf,
            springMvcCorsPlusSecurity,
            springMvcRoleBasedAuthorization,
            springMvcMethodLevelSecurity,
            springMvcSecurityContext,
            springMvcPrincipalSecurity,
        ]
    },
    {
        // 25. Spring MVC + Database
        id: 'springmvc-database',
        name: 'Spring MVC + Database',
        topics: [
            springMvcMvcPlusJdbc,
            springMvcMvcPlusJpa,
            springMvcMvcPlusHibernate,
            springMvcRepositoryLayer,
            springMvcServiceLayer,
            springMvcControllerLayer,
            springMvcDaoPattern,
            springMvcDtoPattern,
            springMvcEntityMapping,
            springMvcTransactionManagement,
            springMvcDatabaseExceptionHandling,
        ]
    },
    {
        // 26. Layered Architecture
        id: 'springmvc-layers',
        name: 'Layered Architecture',
        topics: [
            springMvcControllerLayerLayers,
            springMvcServiceLayerLayers,
            springMvcRepositoryLayerLayers,
            springMvcDaoLayer,
            springMvcEntityLayer,
            springMvcDtoLayer,
            springMvcMapperLayer,
            springMvcUtilityLayer,
            springMvcConfigurationLayer,
            springMvcExceptionLayer,
            springMvcSeparationOfConcerns,
        ]
    },
    {
        // 27. Spring MVC + AJAX
        id: 'springmvc-ajax',
        name: 'Spring MVC + AJAX',
        topics: [
            springMvcAjax,
            springMvcSpringMvcAjaxRequests,
            springMvcJsonAjax,
            springMvcFetchApi,
            springMvcJqueryAjax,
            springMvcAsynchronousFormSubmission,
            springMvcDynamicPageUpdates,
            springMvcRestApiIntegration,
        ]
    },
    {
        // 28. Spring MVC + Thymeleaf
        id: 'springmvc-thymeleaf',
        name: 'Spring MVC + Thymeleaf',
        topics: [
            springMvcThymeleafIntroduction,
            springMvcThymeleafConfiguration,
            springMvcTemplateResolutionThymeleaf,
            springMvcThText,
            springMvcThIf,
            springMvcThEach,
            springMvcThHref,
            springMvcThSrc,
            springMvcThValue,
            springMvcThObject,
            springMvcThField,
            springMvcFormBindingThymeleaf,
            springMvcThymeleafValidation,
            springMvcThymeleafFragments,
            springMvcLayoutsThymeleaf,
            springMvcThymeleafSecurityIntegration,
        ]
    },
    {
        // 29. Spring MVC Testing
        id: 'springmvc-testing',
        name: 'Spring MVC Testing',
        topics: [
            springMvcUnitTesting,
            springMvcControllerTesting,
            springMvcServiceTesting,
            springMvcIntegrationTesting,
            springMvcJunit,
            springMvcMockito,
            springMvcMockmvc,
            springMvcWebmvctest,
            springMvcSpringboottest,
            springMvcControllerMocking,
            springMvcRequestTesting,
            springMvcResponseTesting,
            springMvcExceptionTesting,
            springMvcValidationTesting,
            springMvcSecurityTesting,
        ]
    },
    {
        // 30. Logging & Monitoring
        id: 'springmvc-logging',
        name: 'Logging & Monitoring',
        topics: [
            springMvcSlf4j,
            springMvcLogback,
            springMvcRequestLogging,
            springMvcResponseLogging,
            springMvcExceptionLogging,
            springMvcCorrelationId,
            springMvcMdc,
            springMvcPerformanceLogging,
            springMvcActuatorIntegration,
            springMvcHealthMonitoring,
            springMvcMetrics,
        ]
    },
    {
        // 31. Advanced Spring MVC
        id: 'springmvc-advanced',
        name: 'Advanced Spring MVC',
        topics: [
            springMvcCustomHandlermapping,
            springMvcCustomHandleradapter,
            springMvcCustomViewresolver,
            springMvcCustomArgumentResolver,
            springMvcHandlermethodargumentresolver,
            springMvcCustomReturnValueHandler,
            springMvcHandlermethodreturnvaluehandler,
            springMvcCustomFormatterAdvanced,
            springMvcCustomConverterAdvanced,
            springMvcCustomInterceptor,
            springMvcCustomExceptionResolver,
            springMvcCustomMessageConverterAdvanced,
            springMvcCustomAnnotation,
            springMvcRequestLifecycleCustomization,
        ]
    },
    {
        // 32. Spring MVC Architecture & Design Patterns
        id: 'springmvc-patterns',
        name: 'Spring MVC Architecture & Design Patterns',
        topics: [
            springMvcFrontControllerPatternPatterns,
            springMvcMvcPattern,
            springMvcDependencyInjection,
            springMvcIoc,
            springMvcSingleton,
            springMvcFactoryPattern,
            springMvcStrategyPattern,
            springMvcProxyPattern,
            springMvcTemplateMethodPattern,
            springMvcRepositoryPattern,
            springMvcServiceLayerPattern,
            springMvcDtoPatternPatterns,
            springMvcDaoPatternPatterns,
            springMvcPrgPattern,
        ]
    },
    {
        // 33. Performance Optimization
        id: 'springmvc-performance',
        name: 'Performance Optimization',
        topics: [
            springMvcMvcPerformance,
            springMvcRequestProcessingOptimization,
            springMvcDatabaseOptimization,
            springMvcConnectionPooling,
            springMvcCaching,
            springMvcHttpCaching,
            springMvcResponseCompression,
            springMvcStaticResourceOptimization,
            springMvcAsyncRequestProcessing,
            springMvcCallable,
            springMvcDeferredresult,
            springMvcWebasynctask,
            springMvcStreamingResponsePerformance,
            springMvcThreadPoolManagement,
        ]
    },
    {
        // 34. Production & Enterprise Spring MVC
        id: 'springmvc-production',
        name: 'Production & Enterprise Spring MVC',
        topics: [
            springMvcProductionConfiguration,
            springMvcEnvironmentProfiles,
            springMvcSecurityConfiguration,
            springMvcCentralizedExceptionHandling,
            springMvcApiLogging,
            springMvcAuditLogging,
            springMvcMonitoring,
            springMvcHealthChecks,
            springMvcPerformanceMonitoringProduction,
            springMvcRateLimiting,
            springMvcRequestTracing,
            springMvcGracefulErrorHandling,
            springMvcProductionDeployment,
            springMvcLoadBalancing,
            springMvcReverseProxy,
            springMvcNginxPlusSpringMvc,
            springMvcTomcatConfiguration,
        ]
    },
    {
        // 35. Spring MVC Interview Topics
        id: 'springmvc-interview',
        name: 'Spring MVC Interview Topics',
        topics: [
            springMvcSpringMvcArchitecture,
            springMvcDispatcherservletInterview,
            springMvcDispatcherservletRequestFlowInterview,
            springMvcHandlermappingInterview,
            springMvcHandleradapterInterview,
            springMvcViewresolverInterview,
            springMvcModelVsModelmapVsModelandview,
            springMvcControllerVsRestcontroller,
            springMvcRequestmappingVsGetmapping,
            springMvcRequestparamVsPathvariable,
            springMvcRequestbodyVsModelattribute,
            springMvcFilterVsInterceptorInterview,
            springMvcControlleradviceVsExceptionhandler,
            springMvcValidVsValidated,
            springMvcResponseentityInterview,
            springMvcHttpmessageconverterInterview,
            springMvcJacksonInterview,
            springMvcContentNegotiationInterview,
            springMvcCors,
            springMvcCsrfInterview,
            springMvcSessionVsStateless,
            springMvcMvcVsRest,
            springMvcSpringMvcVsSpringBootInterview,
            springMvcSpringMvcVsSpringWebflux,
            springMvcSynchronousVsAsynchronousRequestProcessing,
        ]
    },
];
