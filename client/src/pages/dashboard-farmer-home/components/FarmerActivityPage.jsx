import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '../../../components/ui/AuthenticatedLayout.jsx';
import Icon from '../../../components/AppIcon.jsx';
import Button from '../../../components/ui/Button.jsx';
import { farmerService } from '../../../services/apiService.js';
import { useLanguage } from '../../../hooks/useLanguage.jsx';

const FarmerActivityPage = () => {
	const { language } = useLanguage();
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);

	useEffect(() => { load(true); }, []);

	const load = async (reset = false) => {
		try {
			setLoading(true);
			const res = await farmerService.getFarmerActivity({ page: reset ? 1 : page, limit: 20 });
			const items = res.activities || res || [];
			setActivities(reset ? items : [...activities, ...items]);
			setHasMore(res?.pagination?.hasNext || false);
			if (reset) setPage(1);
		} catch (e) {
			console.error('Failed to load activities', e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthenticatedLayout>
			<div className="max-w-5xl mx-auto px-4 py-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-text-primary">{language === 'am' ? 'ሁሉም እንቅስቃሴዎች' : 'All Activities'}</h1>
					<Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => load(true)}>
						{language === 'am' ? 'አድስ' : 'Refresh'}
					</Button>
				</div>

				<div className="bg-card border border-border rounded-lg divide-y">
					{loading && activities.length === 0 && (
						<div className="p-6 text-center text-text-secondary">{language === 'am' ? 'በመጫን ላይ...' : 'Loading...'}</div>
					)}
					{!loading && activities.length === 0 && (
						<div className="p-10 text-center">
							<div className="text-5xl mb-2">📭</div>
							<p className="text-text-secondary">{language === 'am' ? 'እንቅስቃሴ አልተገኘም' : 'No activity found'}</p>
						</div>
					)}
					{activities.map((a) => (
						<div key={a.id} className="p-4 flex items-start space-x-3">
							<div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
								<Icon name="Activity" size={16} className="text-primary" />
							</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-text-primary">{a.title || a.type}</p>
									<span className="text-xs text-text-secondary">{new Date(a.created_at || a.timestamp || Date.now()).toLocaleString()}</span>
								</div>
								{a.description && <p className="text-sm text-text-secondary mt-1">{a.description}</p>}
							</div>
						</div>
					))}
				</div>

				{hasMore && (
					<div className="text-center py-6">
						<Button variant="outline" onClick={() => { setPage(p => p + 1); load(false); }}>
							{language === 'am' ? 'ተጨማሪ ይጫኑ' : 'Load More'}
						</Button>
					</div>
				)}
			</div>
		</AuthenticatedLayout>
	);
};

export default FarmerActivityPage;
