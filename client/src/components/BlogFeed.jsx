import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const BlogFeed = () => {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'general',
    tags: ''
  });

  // Get articles from centralized data
  const { userData, publishedArticles, loadPublishedArticles, addArticleToDB } = useUser();
  const articles = publishedArticles;

  const filtered = articles.filter(article =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.summary.toLowerCase().includes(search.toLowerCase()) ||
    (article.author && article.author.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (articleId) => {
    if (!saved.includes(articleId)) {
      setSaved([...saved, articleId]);
    }
  };

  // Load published articles when component mounts
  useEffect(() => {
    loadPublishedArticles();
  }, [loadPublishedArticles]);

  return (
    <div className="w-full flex justify-center items-start p-4 md:p-8">
      <div className="card card-gradient w-full max-w-6xl mt-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-primary text-2xl md:text-3xl font-bold mb-4 md:mb-0">Health Blog & News</h2>
        </div>
        
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input input-dark mb-6 w-full max-w-lg"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => (
            <div key={article.id} className="card card-alt flex flex-col gap-2 p-4 h-full shadow-sm border border-neutral-200 bg-white">
              <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-lg text-primary">{article.title}</div>
                {article.status === 'draft' && (
                  <span className="badge badge-warning text-xs">Draft</span>
                )}
              </div>
              
              {article.category && (
                <div className="mb-2">
                  <span className="badge badge-secondary text-xs">{article.category}</span>
                </div>
              )}
              
              <div className="text-neutral-700 text-base flex-1">{article.summary}</div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {article.tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="badge badge-outline text-xs">#{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="text-neutral-400 text-xs mb-2">
                Published: {new Date(article.date).toLocaleDateString()}
                {article.author && <span> • By {article.author}</span>}
              </div>

              {/* Article stats */}
              <div className="flex gap-2 text-xs text-neutral-500 mb-2">
                <span>👁️ {article.views || 0} views</span>
                <span>❤️ {article.likes || 0} likes</span>
                <span>💾 {article.saved || 0} saved</span>
              </div>
              
              <div className="flex gap-2 mt-auto">
                <button className="btn btn-primary btn-sm">Read More</button>
                <button 
                  className={`btn btn-outline btn-sm ${saved.includes(article.id) ? 'opacity-60' : ''}`} 
                  onClick={() => handleSave(article.id)} 
                  disabled={saved.includes(article.id)}
                >
                  {saved.includes(article.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-neutral-500 py-8">
            <p>No articles found matching your search.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogFeed;