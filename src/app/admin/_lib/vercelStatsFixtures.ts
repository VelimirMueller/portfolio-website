// Test data shared by the Vercel tab tests. Not imported by app code.
import { summarizeDeployments, type VercelDeployment, type VercelStats } from './vercelStats';

/** One Vercel deployment as the panel expects it; pass partials to override. */
export const vercelDeploymentFixture = (over: Partial<VercelDeployment> = {}): VercelDeployment => ({
  id: 'dpl_prod_1',
  url: 'portfolio-website-a1b2c3d.vercel.app',
  state: 'READY',
  target: 'production',
  branch: 'main',
  commitMessage: 'feat: ship the new contact form',
  commitSha: 'a1b2c3d',
  createdAt: '2026-10-10T06:00:00.000Z',
  buildSeconds: 112,
  ...over,
});

export type VercelStatsOk = Extract<VercelStats, { status: 'ok' }>;

/** A full "ok" payload (project + deployments + matching summary). */
export const vercelStatsFixture = (over: Partial<VercelStatsOk> = {}): VercelStatsOk => {
  const deployments = [
    vercelDeploymentFixture(),
    vercelDeploymentFixture({
      id: 'dpl_preview_1',
      url: 'portfolio-website-git-fa3e211.vercel.app',
      target: null,
      branch: 'feat/admin-vercel-tab',
      commitMessage: 'feat(admin): Vercel KPI tab',
      commitSha: 'fa3e211',
      createdAt: '2026-10-10T05:00:00.000Z',
      buildSeconds: 95,
    }),
    vercelDeploymentFixture({
      id: 'dpl_error_1',
      url: 'portfolio-website-git-9d8c7b6.vercel.app',
      state: 'ERROR',
      target: null,
      branch: 'fix/typo',
      commitMessage: 'fix: typo on the about page',
      commitSha: '9d8c7b6',
      createdAt: '2026-10-09T20:00:00.000Z',
      buildSeconds: null,
    }),
    vercelDeploymentFixture({
      id: 'dpl_building_1',
      url: 'portfolio-website-git-4e5f6a7.vercel.app',
      state: 'BUILDING',
      branch: 'main',
      commitMessage: 'chore: deps bump',
      commitSha: '4e5f6a7',
      createdAt: '2026-10-10T07:00:00.000Z',
      buildSeconds: null,
    }),
  ];
  return {
    status: 'ok',
    project: { id: 'prj_portfolio', name: 'portfolio-website' },
    deployments,
    summary: summarizeDeployments(deployments),
    ...over,
  };
};
