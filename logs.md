docker compose up
WARN[0000] /Volumes/FilinSky/PROJECTS/Hummii/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
Compose now can delegate build to bake for better performances
Just set COMPOSE_BAKE=true
[+] Building 83.7s (17/20)            docker:desktop-linux
 => [api internal] load build definition from api.Do  0.0s
 => => transferring dockerfile: 1.54kB                0.0s
 => [api internal] load metadata for docker.io/libra  2.6s
 => [api internal] load .dockerignore                 0.0s
 => => transferring context: 2B                       0.0s
 => [api base 1/1] FROM docker.io/library/node:20-al  0.0s
 => => resolve docker.io/library/node:20-alpine@sha2  0.0s
 => [api internal] load build context                12.2s
 => => transferring context: 305.39MB                11.8s
 => CACHED [api builder 1/4] WORKDIR /app             0.0s
 => CACHED [api production 2/6] RUN addgroup --syste  0.0s
 => CACHED [api production 3/6] RUN adduser --system  0.0s
 => CACHED [api deps 1/6] RUN apk add --no-cache lib  0.0s
 => CACHED [api deps 2/6] WORKDIR /app                0.0s
 => [api deps 3/6] COPY package*.json ./              0.6s
 => [api deps 4/6] COPY pnpm-lock.yaml* ./            0.1s
 => [api deps 5/6] COPY yarn.lock* ./                 0.1s
 => [api deps 6/6] RUN   if [ -f yarn.lock ]; then   41.6s
 => [api builder 2/4] COPY --from=deps /app/node_mod  6.8s 
 => [api builder 3/4] COPY . .                       11.9s 
 => ERROR [api builder 4/4] RUN npm run build         4.5s 
------                                                     
 > [api builder 4/4] RUN npm run build:                    
0.919                                                      
0.919 > hummii-api@1.0.0 build                             
0.919 > nest build                                         
0.919                                                      
4.320 ERROR in ./src/auth/auth.controller.ts:56:43
4.320 TS7006: Parameter 'req' implicitly has an 'any' type.
4.320     54 |   @ApiResponse({ status: 429, description: 'Too many requests' })
4.320     55 |   @HttpCode(HttpStatus.OK)
4.320   > 56 |   async login(@Body() loginDto: LoginDto, @Req() req) {
4.320        |                                           ^^^^^^^^^^
4.320     57 |     const userAgent = req.headers['user-agent'];
4.320     58 |     const ipAddress = req.ip || req.connection.remoteAddress;
4.320     59 |     return this.authService.login(loginDto, userAgent, ipAddress);
4.320 
4.320 ERROR in ./src/auth/auth.controller.ts:85:19
4.320 TS7006: Parameter 'req' implicitly has an 'any' type.
4.320     83 |   @ApiResponse({ status: 204, description: 'All sessions terminated' })
4.320     84 |   @HttpCode(HttpStatus.NO_CONTENT)
4.320   > 85 |   async logoutAll(@Req() req) {
4.320        |                   ^^^^^^^^^^
4.320     86 |     await this.authService.logoutAll(req.user.userId);
4.320     87 |   }
4.320     88 |
4.320 
4.320 ERROR in ./src/auth/auth.controller.ts:120:28
4.320 TS7006: Parameter 'req' implicitly has an 'any' type.
4.320     118 |   @UseGuards(AuthGuard('google'))
4.320     119 |   @ApiOperation({ summary: 'Google OAuth callback' })
4.320   > 120 |   async googleAuthCallback(@Req() req) {
4.320         |                            ^^^^^^^^^^
4.320     121 |     const userAgent = req.headers['user-agent'];
4.320     122 |     const ipAddress = req.ip || req.connection.remoteAddress;
4.320     123 |     return this.authService.oauthLogin(req.user, userAgent, ipAddress);
4.320 
4.320 ERROR in ./src/auth/auth.controller.ts:131:27
4.320 TS7006: Parameter 'req' implicitly has an 'any' type.
4.320     129 |   @ApiOperation({ summary: 'Get all active sessions' })
4.320     130 |   @ApiResponse({ status: 200, description: 'Active sessions retrieved' })
4.320   > 131 |   async getActiveSessions(@Req() req) {
4.320         |                           ^^^^^^^^^^
4.320     132 |     return this.authService.getActiveSessions(req.user.userId);
4.320     133 |   }
4.320     134 |
4.320 
4.320 ERROR in ./src/auth/auth.controller.ts:141:23
4.320 TS7006: Parameter 'req' implicitly has an 'any' type.
4.320     139 |   @ApiResponse({ status: 204, description: 'Session deleted successfully' })
4.320     140 |   @HttpCode(HttpStatus.NO_CONTENT)
4.320   > 141 |   async deleteSession(@Req() req, @Param('sessionId') sessionId: string) {
4.320         |                       ^^^^^^^^^^
4.320     142 |     await this.authService.deleteSession(req.user.userId, sessionId);
4.320     143 |   }
4.320     144 | }
4.320 
4.320 ERROR in ./src/shared/audit/audit.service.ts:25:25
4.320 TS2339: Property 'auditLog' does not exist on type 'PrismaService'.
4.320     23 |   async log(data: CreateAuditLogDto): Promise<void> {
4.320     24 |     try {
4.320   > 25 |       await this.prisma.auditLog.create({
4.320        |                         ^^^^^^^^
4.320     26 |         data: {
4.320     27 |           userId: data.userId,
4.320     28 |           action: data.action,
4.320 
4.320 ERROR in ./src/shared/audit/audit.service.ts:50:24
4.320 TS2339: Property 'auditLog' does not exist on type 'PrismaService'.
4.320     48 |    */
4.320     49 |   async getUserAuditLogs(userId: string, limit: number = 100) {
4.320   > 50 |     return this.prisma.auditLog.findMany({
4.320        |                        ^^^^^^^^
4.320     51 |       where: { userId },
4.320     52 |       orderBy: { createdAt: 'desc' },
4.320     53 |       take: limit,
4.320 
4.320 ERROR in ./src/shared/audit/audit.service.ts:61:24
4.320 TS2339: Property 'auditLog' does not exist on type 'PrismaService'.
4.320     59 |    */
4.320     60 |   async getAuditLogsByAction(action: string, limit: number = 100) {
4.320   > 61 |     return this.prisma.auditLog.findMany({
4.320        |                        ^^^^^^^^
4.320     62 |       where: { action },
4.320     63 |       orderBy: { createdAt: 'desc' },
4.320     64 |       take: limit,
4.320 
4.320 ERROR in ./src/shared/audit/audit.service.ts:81:24
4.320 TS2339: Property 'auditLog' does not exist on type 'PrismaService'.
4.320     79 |    */
4.320     80 |   async getEntityAuditLogs(entity: string, entityId: string, limit: number = 100) {
4.320   > 81 |     return this.prisma.auditLog.findMany({
4.320        |                        ^^^^^^^^
4.320     82 |       where: {
4.320     83 |         entity,
4.320     84 |         entityId,
4.320 
4.320 ERROR in ./src/shared/audit/audit.service.ts:107:24
4.320 TS2339: Property 'auditLog' does not exist on type 'PrismaService'.
4.320     105 |     since.setHours(since.getHours() - hours);
4.320     106 |
4.320   > 107 |     return this.prisma.auditLog.findMany({
4.320         |                        ^^^^^^^^
4.320     108 |       where: {
4.320     109 |         action: 'LOGIN_FAILED',
4.320     110 |         createdAt: {
4.320 
4.320 ERROR in ./src/shared/audit/audit.service.ts:136:38
4.320 TS2339: Property 'auditLog' does not exist on type 'PrismaService'.
4.320     134 |     cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
4.320     135 |
4.320   > 136 |     const result = await this.prisma.auditLog.deleteMany({
4.320         |                                      ^^^^^^^^
4.320     137 |       where: {
4.320     138 |         createdAt: {
4.320     139 |           lt: cutoffDate,
4.320 
4.320 webpack 5.97.1 compiled with 11 errors in 2660 ms
4.342 npm notice
4.342 npm notice New major version of npm available! 10.8.2 -> 11.6.2
4.342 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.2
4.342 npm notice To update run: npm install -g npm@11.6.2
4.342 npm notice
------
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
daniilfilinski@Mac-mini-Daniil Hummii % 

