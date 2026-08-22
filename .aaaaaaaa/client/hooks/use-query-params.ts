import { useLocation } from 'react-router-dom';

export const useQueryParams = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const clickid = params.get('clickid');
  const id = params.get('id');
  
  if (clickid || id) {
    const query = new URLSearchParams();
    if (clickid) query.set('clickid', clickid);
    if (id) query.set('id', id);
    return `?${query.toString()}`;
  }
  
  return '';
};
