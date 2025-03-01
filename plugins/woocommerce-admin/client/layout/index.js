/**
 * External dependencies
 */
import { SlotFillProvider } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Component, lazy, Suspense, useEffect } from '@wordpress/element';
import {
	unstable_HistoryRouter as HistoryRouter,
	Route,
	Routes,
	useLocation,
	useMatch,
	useParams,
} from 'react-router-dom';
import { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { isFunction, identity } from 'lodash';
import {
	CustomerEffortScoreModalContainer,
	triggerExitPageCesSurvey,
} from '@woocommerce/customer-effort-score';
import { getHistory, getQuery } from '@woocommerce/navigation';
import {
	PLUGINS_STORE_NAME,
	useUser,
	withPluginsHydration,
	withOptionsHydration,
} from '@woocommerce/data';
import { recordPageView } from '@woocommerce/tracks';
import '@woocommerce/notices';
import { PluginArea } from '@wordpress/plugins';
import {
	LayoutContextProvider,
	getLayoutContextValue,
} from '@woocommerce/admin-layout';

/**
 * Internal dependencies
 */
import './style.scss';
import { Controller, getPages } from './controller';
import { Header } from '../header';
import { Footer } from './footer';
import Notices from './notices';
import { TransientNotices } from './transient-notices';
import { getAdminSetting } from '~/utils/admin-settings';
import { usePageClasses } from './hooks/use-page-classes';
import '~/activity-panel';
import '~/mobile-banner';
import './navigation';

const StoreAlerts = lazy( () =>
	import( /* webpackChunkName: "store-alerts" */ './store-alerts' )
);

const WCPayUsageModal = lazy( () =>
	import(
		/* webpackChunkName: "wcpay-usage-modal" */ '../task-lists/fills/PaymentGatewaySuggestions/components/WCPay/UsageModal'
	)
);

export class PrimaryLayout extends Component {
	render() {
		const { children } = this.props;
		return (
			<div
				className="woocommerce-layout__primary"
				id="woocommerce-layout__primary"
			>
				{ window.wcAdminFeatures[ 'store-alerts' ] && (
					<Suspense fallback={ null }>
						<StoreAlerts />
					</Suspense>
				) }
				<Notices />
				{ children }
			</div>
		);
	}
}

/**
 * Exists for the sole purpose of passing on react-router hooks into
 * the class based Layout component. Feel free to refactor it by turning _Layout
 * into a functional component and moving the hooks inside
 *
 * @param {Object} root0          root0 React component props
 * @param {Object} root0.children Children componeents
 */
const WithReactRouterProps = ( { children } ) => {
	const location = useLocation();
	const match = useMatch( location.pathname );
	const params = useParams();
	const matchProp = { params, url: match.pathname };
	return Children.toArray( children ).map( ( child ) => {
		return cloneElement( child, {
			...child.props,
			location,
			match: matchProp,
		} );
	} );
};

/**
 * Wraps _Layout with WithReactRouterProps for non-embedded page renders
 * We need this because the hooks fail for embedded page renders as there is no Router context above it.
 *
 * @param {Object} props React component props
 */
const LayoutSwitchWrapper = ( props ) => {
	if ( props.isEmbedded ) {
		return <_Layout { ...props } />;
	}
	return (
		<WithReactRouterProps>
			<_Layout { ...props } />
		</WithReactRouterProps>
	);
};

function _Layout( {
	activePlugins,
	installedPlugins,
	isEmbedded,
	isJetpackConnected,
	location,
	match,
	page,
} ) {
	usePageClasses( page );

	function recordPageViewTrack() {
		const navigationFlag = {
			has_navigation: !! window.wcNavigation,
		};

		if ( isEmbedded ) {
			const path = document.location.pathname + document.location.search;
			recordPageView( path, {
				is_embedded: true,
				...navigationFlag,
			} );
			return;
		}

		const { pathname } = location;
		if ( ! pathname ) {
			return;
		}

		// Remove leading slash, and camel case remaining pathname
		let path = pathname.substring( 1 ).replace( /\//g, '_' );

		// When pathname is `/` we are on the home screen.
		if ( path.length === 0 ) {
			path = 'home_screen';
		}

		recordPageView( path, {
			jetpack_installed: installedPlugins.includes( 'jetpack' ),
			jetpack_active: activePlugins.includes( 'jetpack' ),
			jetpack_connected: isJetpackConnected,
			...navigationFlag,
		} );
	}

	useEffect( () => {
		triggerExitPageCesSurvey();
	}, [] );

	useEffect( () => {
		recordPageViewTrack();
		setTimeout( () => {
			triggerExitPageCesSurvey();
		}, 0 );
	}, [ location?.pathname ] );

	function isWCPaySettingsPage() {
		const { page: queryPage, section, tab } = getQuery();
		return (
			queryPage === 'wc-settings' &&
			tab === 'checkout' &&
			section === 'woocommerce_payments'
		);
	}

	const { breadcrumbs, layout = { header: true, footer: true } } = page;
	const { header: showHeader = true, footer: showFooter = true } = layout;

	const query = getQuery();

	useEffect( () => {
		const wpbody = document.getElementById( 'wpbody' );
		if ( showHeader ) {
			wpbody?.classList.remove( 'no-header' );
		} else {
			wpbody?.classList.add( 'no-header' );
		}
	}, [ showHeader ] );

	return (
		<LayoutContextProvider
			value={ getLayoutContextValue( [
				page?.navArgs?.id?.toLowerCase() || 'page',
			] ) }
		>
			<SlotFillProvider>
				<div className="woocommerce-layout">
					{ showHeader && (
						<Header
							sections={
								isFunction( breadcrumbs )
									? breadcrumbs( { match } )
									: breadcrumbs
							}
							isEmbedded={ isEmbedded }
							query={ query }
						/>
					) }
					<TransientNotices />
					{ ! isEmbedded && (
						<PrimaryLayout>
							<div className="woocommerce-layout__main">
								<Controller
									page={ page }
									match={ match }
									query={ query }
								/>
							</div>
						</PrimaryLayout>
					) }

					{ isEmbedded && isWCPaySettingsPage() && (
						<Suspense fallback={ null }>
							<WCPayUsageModal />
						</Suspense>
					) }
					{ showFooter && <Footer /> }
					<CustomerEffortScoreModalContainer />
				</div>
				<PluginArea scope="woocommerce-admin" />
				{ window.wcAdminFeatures.navigation && (
					<PluginArea scope="woocommerce-navigation" />
				) }
				<PluginArea scope="woocommerce-tasks" />
			</SlotFillProvider>
		</LayoutContextProvider>
	);
}

_Layout.propTypes = {
	isEmbedded: PropTypes.bool,
	page: PropTypes.shape( {
		container: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.object, // Support React.lazy
		] ),
		path: PropTypes.string,
		breadcrumbs: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.arrayOf(
				PropTypes.oneOfType( [
					PropTypes.arrayOf( PropTypes.string ),
					PropTypes.string,
				] )
			),
		] ).isRequired,
		wpOpenMenu: PropTypes.string,
	} ).isRequired,
};

const dataEndpoints = getAdminSetting( 'dataEndpoints' );
const Layout = compose(
	withPluginsHydration( {
		...getAdminSetting( 'plugins', {} ),
		jetpackStatus:
			( dataEndpoints && dataEndpoints.jetpackStatus ) || false,
	} ),
	withSelect( ( select, { isEmbedded } ) => {
		// Embedded pages don't send plugin info to Tracks.
		if ( isEmbedded ) {
			return;
		}

		const { getActivePlugins, getInstalledPlugins, isJetpackConnected } =
			select( PLUGINS_STORE_NAME );

		return {
			activePlugins: getActivePlugins(),
			isJetpackConnected: isJetpackConnected(),
			installedPlugins: getInstalledPlugins(),
		};
	} )
)( LayoutSwitchWrapper );

const _PageLayout = () => {
	const { currentUserCan } = useUser();

	// get the basename, usually 'wp-admin/' but can be something else if the site installation changed it
	const path = document.location.pathname;
	const basename = path.substring( 0, path.lastIndexOf( '/' ) );

	return (
		<HistoryRouter history={ getHistory() }>
			<Routes basename={ basename }>
				{ getPages()
					.filter(
						( page ) =>
							! page.capability ||
							currentUserCan( page.capability )
					)
					.map( ( page ) => {
						return (
							<Route
								key={ page.path }
								path={ page.path }
								exact
								element={ <Layout page={ page } /> }
							/>
						);
					} ) }
			</Routes>
		</HistoryRouter>
	);
};

export const PageLayout = compose(
	window.wcSettings.admin
		? withOptionsHydration( {
				...getAdminSetting( 'preloadOptions', {} ),
		  } )
		: identity
)( _PageLayout );

const _EmbedLayout = () => (
	<Layout
		page={ {
			breadcrumbs: getAdminSetting( 'embedBreadcrumbs', [] ),
		} }
		isEmbedded
	/>
);

export const EmbedLayout = compose(
	getAdminSetting( 'preloadOptions' )
		? withOptionsHydration( {
				...getAdminSetting( 'preloadOptions' ),
		  } )
		: identity
)( _EmbedLayout );
