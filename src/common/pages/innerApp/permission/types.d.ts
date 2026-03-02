interface GenerateAuthRouteProps {
  appName: string;
  otherRoleDescriptions: string[];
}

interface Role {
  description: string;
  roleCode: string;
  roleName: string;
}

interface RoleUser {
  mobile: string;
  roleCode: string;
  uname: string;
  userId: number;
  warehouseList?: {
    id: ID;
    name: string;
  }[];
  name: string;
}

interface SchoolAdmin {
  active: boolean;
  headImageUrl: string;
  id: number;
  identityDcode: string;
  identityValue: string;
  mobile: string;
  name: string;
  namePinyin: string;
  nickname: string;
  source: string;
  userType: string;
  username: string;
}