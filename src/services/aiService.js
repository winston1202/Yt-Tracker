const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      } catch (error) {
        console.error('Error initializing OpenAI:', error);
        this.openai = null;
      }
    }
  }

  // Generate viral title suggestions
  async generateTitleSuggestions(video) {
    try {
      if (!this.openai) {
        return this.getFallbackTitles(video);
      }

      const prompt = `Based on this viral ${video.isShort ? 'YouTube Short' : 'YouTube video'} that has ${video.views} views and is performing ${video.outlierFactor}x above average:

Title: "${video.title}"
Category: ${video.category}
Views: ${video.views}
Engagement: ${video.likes} likes, ${video.comments} comments

Generate 5 viral-style title variations that could perform even better. Focus on:
- Emotional hooks and curiosity gaps
- Numbers and specific claims
- Trending keywords and phrases
- ${video.isShort ? 'Short-form attention grabbers' : 'Compelling long-form promises'}

Format as a simple numbered list:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.8
      });

      const suggestions = completion.choices[0].message.content
        .split('\n')
        .filter(line => line.trim() && /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 5);

      return suggestions.length > 0 ? suggestions : this.getFallbackTitles(video);
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      return this.getFallbackTitles(video);
    }
  }

  // Generate thumbnail concept suggestions
  async generateThumbnailSuggestions(video) {
    try {
      if (!this.openai) {
        return this.getFallbackThumbnails(video);
      }

      const prompt = `For this viral ${video.isShort ? 'YouTube Short' : 'YouTube video'}:

Title: "${video.title}"
Category: ${video.category}
Performance: ${video.outlierFactor}x above average

Suggest 3 high-converting thumbnail concepts that would grab attention and increase click-through rates. Consider:
- Bold, contrasting colors
- Emotional facial expressions
- Clear, readable text overlays
- Visual elements that create curiosity
- ${video.isShort ? 'Mobile-optimized design' : 'Desktop and mobile appeal'}

Format each suggestion as: "Concept: [brief description]"`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
        temperature: 0.7
      });

      const suggestions = completion.choices[0].message.content
        .split('\n')
        .filter(line => line.includes('Concept:'))
        .map(line => line.replace(/^.*Concept:\s*/, '').trim())
        .slice(0, 3);

      return suggestions.length > 0 ? suggestions : this.getFallbackThumbnails(video);
    } catch (error) {
      console.error('Error generating thumbnail suggestions:', error);
      return this.getFallbackThumbnails(video);
    }
  }

  // Generate niche twist suggestions
  async generateNicheTwists(video) {
    try {
      if (!this.openai) {
        return this.getFallbackTwists(video);
      }

      const prompt = `This ${video.isShort ? 'YouTube Short' : 'YouTube video'} is going viral:

Title: "${video.title}"
Category: ${video.category}
Performance: ${video.outlierFactor}x above baseline

Suggest 3 creative ways to adapt this viral concept into new angles or niches. Think about:
- Different target audiences
- Alternative perspectives or approaches
- Related topics or industries
- Trending formats or styles

Format as: "Twist: [brief description of the new angle]"`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.9
      });

      const suggestions = completion.choices[0].message.content
        .split('\n')
        .filter(line => line.includes('Twist:'))
        .map(line => line.replace(/^.*Twist:\s*/, '').trim())
        .slice(0, 3);

      return suggestions.length > 0 ? suggestions : this.getFallbackTwists(video);
    } catch (error) {
      console.error('Error generating niche twists:', error);
      return this.getFallbackTwists(video);
    }
  }

  // Fallback title suggestions when AI is not available
  getFallbackTitles(video) {
    const templates = [
      `${video.isShort ? 'This' : 'The'} ${video.category} Secret That Got ${this.formatViews(video.views)} Views`,
      `Why This ${video.category} Video Went Viral (${video.outlierFactor}x Growth!)`,
      `${video.isShort ? 'Quick' : 'Ultimate'} ${video.category} Hack Everyone's Talking About`,
      `This ${video.category} Trend is Breaking the Internet`,
      `${video.isShort ? 'POV:' : 'What Happens When'} You Try This ${video.category} Method`
    ];
    return templates;
  }

  // Fallback thumbnail suggestions
  getFallbackThumbnails(video) {
    return [
      `Split-screen before/after with shocked expression and "${video.outlierFactor}x" text overlay`,
      `Close-up reaction face with bright arrows pointing to key visual element`,
      `Bold text "${this.formatViews(video.views)} VIEWS!" with contrasting background colors`
    ];
  }

  // Fallback niche twist suggestions
  getFallbackTwists(video) {
    return [
      `Apply this ${video.category} concept to a different age demographic`,
      `Create a "behind the scenes" or "reaction" version of this content`,
      `Combine this trend with another popular ${video.isShort ? 'Short' : 'long-form'} format`
    ];
  }

  // Format view count for suggestions
  formatViews(views) {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  }

  // Generate all suggestions at once
  async generateAllSuggestions(video) {
    try {
      const [titles, thumbnails, twists] = await Promise.all([
        this.generateTitleSuggestions(video),
        this.generateThumbnailSuggestions(video),
        this.generateNicheTwists(video)
      ]);

      return {
        titles,
        thumbnails,
        twists,
        generated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating all suggestions:', error);
      return {
        titles: this.getFallbackTitles(video),
        thumbnails: this.getFallbackThumbnails(video),
        twists: this.getFallbackTwists(video),
        generated: new Date().toISOString()
      };
    }
  }
}

module.exports = new AIService();