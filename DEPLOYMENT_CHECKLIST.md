# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`
- [ ] Find and set `ENPHASE_SITE_ID` from Enphase Enlighten dashboard
- [ ] Verify `ENPHASE_CLIENT_ID` is correct
- [ ] Verify `ENPHASE_CLIENT_SECRET` is correct  
- [ ] Verify `ENPHASE_API_KEY` is correct
- [ ] Set correct `NEXTAUTH_URL` (production domain for prod, localhost for dev)

### ✅ Local Testing

- [ ] Install Docker Desktop (if not already installed)
- [ ] Run `docker-compose up --build`
- [ ] Access http://localhost:3000
- [ ] Click "Sign in with Enphase"
- [ ] Complete OAuth authorization
- [ ] Verify dashboard loads
- [ ] Verify all 4 overview cards show data
- [ ] Verify Production chart renders
- [ ] Verify Consumption chart renders
- [ ] Wait 5 minutes and verify auto-refresh works
- [ ] Check browser console for errors
- [ ] Check docker logs for errors: `docker-compose logs -f`

### ✅ Code Review

- [ ] All TypeScript files compile without errors
- [ ] No console.error statements in production code
- [ ] All environment variables are properly used
- [ ] API endpoints return proper error messages
- [ ] Authentication flow works correctly
- [ ] Token refresh works correctly

## Coolify Deployment Checklist

### ✅ Repository Setup

- [ ] Initialize git repository: `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial solar monitoring app"`
- [ ] Create GitHub/GitLab repository
- [ ] Add remote: `git remote add origin <your-repo-url>`
- [ ] Push: `git push -u origin main`

### ✅ Coolify Configuration

- [ ] Log into Coolify dashboard
- [ ] Click "New Resource"
- [ ] Select "Docker Compose"
- [ ] Connect your Git repository
- [ ] Select branch (main/master)
- [ ] Verify Coolify detects `docker-compose.yml`

### ✅ Environment Variables in Coolify

Add these in Coolify's environment variables section:

```bash
# REQUIRED - Update these!
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl>
ENPHASE_SITE_ID=<your-site-id>

# Pre-configured (verify these are correct)
ENPHASE_CLIENT_ID=00a39c3d2a6062b3cabfe389953ebd22
ENPHASE_CLIENT_SECRET=5ef06eb90c7725fd6d2bbef04de90223
ENPHASE_API_KEY=09f924267e8c045fc65daac3778645ed

# Public variable (must match CLIENT_ID)
NEXT_PUBLIC_ENPHASE_CLIENT_ID=00a39c3d2a6062b3cabfe389953ebd22
```

- [ ] `NEXTAUTH_URL` set to your production domain
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `ENPHASE_SITE_ID` set to your site ID
- [ ] `ENPHASE_CLIENT_ID` verified
- [ ] `ENPHASE_CLIENT_SECRET` verified
- [ ] `ENPHASE_API_KEY` verified
- [ ] `NEXT_PUBLIC_ENPHASE_CLIENT_ID` matches `ENPHASE_CLIENT_ID`

### ✅ Domain Configuration

- [ ] Add custom domain in Coolify
- [ ] Configure DNS records (A or CNAME)
- [ ] Enable HTTPS/SSL certificate
- [ ] Verify domain resolves correctly

### ✅ Deploy

- [ ] Click "Deploy" in Coolify
- [ ] Monitor build logs
- [ ] Verify build completes successfully
- [ ] Check deployment logs for errors

### ✅ Post-Deployment Testing

- [ ] Visit your production domain
- [ ] Verify HTTPS is working
- [ ] Click "Sign in with Enphase"
- [ ] Complete OAuth flow (may need to re-authorize)
- [ ] Verify dashboard loads
- [ ] Verify all data displays correctly
- [ ] Test on mobile device
- [ ] Test auto-refresh (wait 5-15 minutes)
- [ ] Verify logout works
- [ ] Test re-login

## Monitoring & Maintenance

### ✅ Regular Checks

- [ ] Check Coolify logs for errors
- [ ] Monitor API rate limits
- [ ] Verify data is updating regularly
- [ ] Check for any authentication issues
- [ ] Review application performance

### ✅ Enphase API

- [ ] Verify API credentials are still valid
- [ ] Check API usage in Enphase portal
- [ ] Ensure rate limits are not exceeded
- [ ] Monitor for API deprecation notices

### ✅ Security

- [ ] Keep Next.js and dependencies updated
- [ ] Rotate `NEXTAUTH_SECRET` periodically
- [ ] Review Coolify security settings
- [ ] Monitor for security vulnerabilities
- [ ] Keep Docker images updated

## Troubleshooting Guide

### Issue: Build Fails

**Check:**
- [ ] Docker is running
- [ ] No syntax errors in code
- [ ] All dependencies in `package.json` are valid
- [ ] `Dockerfile` and `docker-compose.yml` are correct

**Fix:**
```bash
docker-compose down
docker-compose up --build
```

### Issue: Authentication Not Working

**Check:**
- [ ] `NEXTAUTH_URL` matches your domain exactly
- [ ] `NEXTAUTH_SECRET` is set
- [ ] Enphase API credentials are correct
- [ ] Browser cookies are enabled
- [ ] No CORS issues in browser console

**Fix:**
- Regenerate `NEXTAUTH_SECRET`
- Clear browser cookies
- Verify Enphase OAuth redirect URIs

### Issue: No Data Displaying

**Check:**
- [ ] `ENPHASE_SITE_ID` is correct
- [ ] Access token is valid (check logs)
- [ ] API rate limits not exceeded
- [ ] Network connectivity to Enphase API

**Fix:**
- Verify Site ID in Enphase Enlighten
- Check API logs: `docker-compose logs -f`
- Re-authenticate to get fresh token

### Issue: Charts Not Rendering

**Check:**
- [ ] Browser console for JavaScript errors
- [ ] Data is being returned from API
- [ ] Recharts library loaded correctly

**Fix:**
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check API response structure
- Verify date-fns is working

### Issue: High Memory Usage

**Check:**
- [ ] React Query cache size
- [ ] Memory leaks in components
- [ ] Docker container limits

**Fix:**
- Reduce refetch intervals
- Restart container: `docker-compose restart`
- Increase container memory limit

## Rollback Plan

If deployment fails:

1. **Coolify Rollback:**
   - [ ] Click "Previous Deployments" in Coolify
   - [ ] Select last working version
   - [ ] Click "Redeploy"

2. **Manual Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Emergency Shutdown:**
   ```bash
   # In Coolify
   Stop Service → Confirm
   ```

## Success Criteria

Your deployment is successful when:

- ✅ Application is accessible at your domain
- ✅ HTTPS is working
- ✅ Authentication flow completes successfully
- ✅ Dashboard loads and displays all data
- ✅ All 4 overview cards show correct values
- ✅ Production chart displays 24h data
- ✅ Consumption chart displays 24h data
- ✅ Auto-refresh works after 5-15 minutes
- ✅ No errors in Coolify logs
- ✅ No errors in browser console
- ✅ Mobile-responsive design works
- ✅ Sign out and sign in works

## Post-Launch

- [ ] Document any custom configurations
- [ ] Share access credentials with team
- [ ] Set up monitoring alerts (optional)
- [ ] Create backup of environment variables
- [ ] Schedule regular maintenance checks
- [ ] Plan for future enhancements

## Support Contacts

**Technical Issues:**
- Check logs: `docker-compose logs -f`
- Review ARCHITECTURE.md for system design
- Review README.md for documentation

**Enphase API Issues:**
- Visit: https://developer.enphase.com
- Check API status page
- Review rate limits

**Coolify Issues:**
- Check Coolify documentation
- Review Coolify server logs
- Verify Docker is running

---

✨ **Remember:** Always test locally before deploying to production!

🔐 **Security:** Never commit `.env` file to git!

📊 **Monitoring:** Check logs regularly for any issues.

🚀 **Success:** Once deployed, your solar monitoring dashboard will be live 24/7!
