export interface UserModel {
    username: string
    organization: string
    DateOfBirth: string
    role: 'admin' | 'project_manager' | 'site_engineer' | 'viewer'
    email: string
    password: string
}