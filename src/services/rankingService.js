/**
 * AI Ranking Service
 *
 * Purpose: Automatically score and rank candidates based on AI analysis
 * Location: /services/rankingService.js
 *
 * Features:
 * ✅ Calculate AI scores for candidates
 * ✅ Rank candidates per job
 * ✅ Update application rankings
 * ✅ Get top candidates globally
 */

const Application = require("../lib/models/Application");

class RankingService {
  /**
   * Rank candidates for a specific job
   * @param {string} jobId - Job ID to rank candidates for
   * @returns {Promise<Array>} Sorted and ranked applications
   */
  async rankCandidates(jobId) {
    try {
      console.log(`🔄 Ranking candidates for job: ${jobId}`);

      // Get all applications for this job
      const apps = await Application.find({ job: jobId })
        .populate('user', 'name email')
        .populate('job', 'title company');

      if (apps.length === 0) {
        console.log('ℹ️ No applications found for this job');
        return [];
      }

      // Sort by AI score (highest first)
      const sorted = apps.sort((a, b) => {
        const scoreA = a.aiScore?.total || 0;
        const scoreB = b.aiScore?.total || 0;
        return scoreB - scoreA;
      });

      // Update ranks in database
      for (let i = 0; i < sorted.length; i++) {
        sorted[i].rank = i + 1;
        await sorted[i].save();
        console.log(`📊 Ranked ${sorted[i].user.name}: Position ${i + 1}, Score: ${sorted[i].aiScore?.total || 0}`);
      }

      console.log(`✅ Ranked ${sorted.length} candidates for job ${jobId}`);
      return sorted;
    } catch (error) {
      console.error('❌ Error ranking candidates:', error);
      throw error;
    }
  }

  /**
   * Calculate AI score for a single application
   * @param {Object} application - Application document
   * @param {Object} job - Job document
   * @returns {Promise<Object>} Updated application with AI score
   */
  async calculateAIScore(application, job) {
    try {
      // This would integrate with your existing CV analysis service
      // For now, we'll create a mock scoring system
      const mockScore = this.generateMockAIScore(application, job);

      application.aiScore = mockScore;
      await application.save();

      console.log(`🤖 Calculated AI score for ${application.user?.name || 'Unknown'}: ${mockScore.total}`);
      return application;
    } catch (error) {
      console.error('❌ Error calculating AI score:', error);
      throw error;
    }
  }

  /**
   * Generate mock AI score (replace with real AI analysis)
   * @param {Object} application - Application data
   * @param {Object} job - Job data
   * @returns {Object} AI score object
   */
  generateMockAIScore(application, job) {
    // Mock scoring based on available data
    // In production, this would use your CV analysis service
    const skills = Math.floor(Math.random() * 40) + 60; // 60-100
    const experience = Math.floor(Math.random() * 30) + 70; // 70-100
    const communication = Math.floor(Math.random() * 20) + 80; // 80-100

    const total = Math.round((skills + experience + communication) / 3);

    return {
      total,
      skills,
      experience,
      communication
    };
  }

  /**
   * Get top candidates globally
   * @param {number} limit - Number of top candidates to return
   * @returns {Promise<Array>} Top ranked applications
   */
  async getTopCandidates(limit = 20) {
    try {
      console.log(`🔍 Getting top ${limit} candidates globally`);

      const top = await Application.find()
        .sort({ "aiScore.total": -1 })
        .limit(limit)
        .populate("user", "name email profilePicture")
        .populate("job", "title company location");

      console.log(`✅ Found ${top.length} top candidates`);
      return top;
    } catch (error) {
      console.error('❌ Error getting top candidates:', error);
      throw error;
    }
  }

  /**
   * Get top candidates for a specific job
   * @param {string} jobId - Job ID
   * @param {number} limit - Number of candidates to return
   * @returns {Promise<Array>} Top candidates for the job
   */
  async getTopCandidatesForJob(jobId, limit = 10) {
    try {
      console.log(`🔍 Getting top ${limit} candidates for job: ${jobId}`);

      const top = await Application.find({ job: jobId })
        .sort({ "aiScore.total": -1 })
        .limit(limit)
        .populate("user", "name email profilePicture")
        .populate("job", "title company location");

      console.log(`✅ Found ${top.length} top candidates for job ${jobId}`);
      return top;
    } catch (error) {
      console.error('❌ Error getting top candidates for job:', error);
      throw error;
    }
  }

  /**
   * Update rankings for all jobs (batch operation)
   * @returns {Promise<Object>} Update summary
   */
  async updateAllRankings() {
    try {
      console.log('🔄 Starting batch ranking update for all jobs');

      const jobs = await Application.distinct('job');
      let totalUpdated = 0;

      for (const jobId of jobs) {
        const ranked = await this.rankCandidates(jobId);
        totalUpdated += ranked.length;
      }

      console.log(`✅ Updated rankings for ${totalUpdated} applications across ${jobs.length} jobs`);
      return {
        success: true,
        jobsUpdated: jobs.length,
        applicationsUpdated: totalUpdated
      };
    } catch (error) {
      console.error('❌ Error updating all rankings:', error);
      throw error;
    }
  }
}

module.exports = new RankingService();