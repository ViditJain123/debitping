import DashboardClientWrapper from '../../components/DashboardClientWrapper';

export default function DashboardLayout({ children }) {
  return (
    <DashboardClientWrapper>
      {children}
    </DashboardClientWrapper>
  );
}
