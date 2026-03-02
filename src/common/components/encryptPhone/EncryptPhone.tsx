import { Popover } from 'antd';
interface EncryptMobileProps {
  mobile: string | number;
}

const EncryptMobile = (props: EncryptMobileProps) => {
  const { mobile } = props;
  const encryptPhone = (phone: number | string) => {
    if (!phone) return '';
    const ps = phone.toString();
    return ps.length === 11 ? `${ps.substring(0, 3)}****${ps.substring(7, 11)}` : ps;
  };
  return (
    <Popover content={mobile}>
      { encryptPhone(mobile) }
    </Popover>
  );
};
export default EncryptMobile;
