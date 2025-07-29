import React, { useState } from 'react';

const AdminDashboardArticles = ({ articles, articlesLoading, editingArticle, articleEdit, setArticleEdit, startEditArticle, saveEditArticle, setEditingArticle, deleteArticle, newArticle, setNewArticle, addArticle, onRefresh }) => {
  // Summary stats
  const totalArticles = articles.length;
  const published = articles.filter(a => a.status === 'published').length;
  const drafts = articles.filter(a => a.status === 'draft').length;
  const mostRecent = articles.length ? articles.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b) : null;

  // Search/filter
  const [search, setSearch] = useState('');
  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.author && a.author.toLowerCase().includes(search.toLowerCase()))
  );

  // Mock badge/engagement data for demo
  const getBadges = (article) => [
    <span key="views" className="badge badge-secondary bg-opacity-80">{article.views ? `${article.views} views` : '0 views'}</span>,
    <span key="likes" className="badge badge-secondary bg-opacity-80">{article.likes ? `${article.likes} likes` : '0 likes'}</span>,
    <span key="status" className={`badge ${article.status === 'published' ? 'badge-success' : 'badge-warning'} bg-opacity-80`}>{article.status || 'draft'}</span>,
  ];

  return (
    <div className="animate-slideInUp w-full max-w-7xl mx-auto px-2 md:px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
        <h2 className="text-2xl font-bold text-primary">Blog Articles</h2>
        <button 
          onClick={onRefresh} 
          className="btn btn-outline btn-sm"
          disabled={articlesLoading}
        >
          {articlesLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {articlesLoading && articles.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-primary">Loading articles...</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* 1st Column: Summary/statistics */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-4 flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">Total Articles</span>
            <span className="text-2xl font-bold">{totalArticles}</span>
          </div>
          <div className="glass-card p-4 flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">Published</span>
            <span className="text-2xl font-bold text-success">{published}</span>
          </div>
          <div className="glass-card p-4 flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">Drafts</span>
            <span className="text-2xl font-bold text-warning">{drafts}</span>
          </div>
          <div className="glass-card p-4 flex flex-col items-center">
            <span className="text-lg font-semibold text-primary">Most Recent</span>
            <span className="text-md font-bold text-info">{mostRecent ? mostRecent.title : '-'}</span>
          </div>
        </div>
        {/* 2nd Column: Add blog form with date and badges */}
        <div className="flex flex-col gap-6">
          <div className="card card-gradient">
            <div className="card-header">
              <h3 className="card-title">Add New Article</h3>
            </div>
            <form onSubmit={addArticle} className="flex flex-col gap-4">
              <div className="form-group w-full">
                <label className="form-label">Title</label>
                <input
                  value={newArticle.title}
                  onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="Enter article title"
                  className="input-dark w-full"
                  required
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Summary</label>
                <textarea
                  value={newArticle.summary}
                  onChange={e => setNewArticle({ ...newArticle, summary: e.target.value })}
                  placeholder="Brief summary of the article"
                  className="input-dark w-full"
                  rows="3"
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Content</label>
                <textarea
                  value={newArticle.content}
                  onChange={e => setNewArticle({ ...newArticle, content: e.target.value })}
                  placeholder="Full article content"
                  className="input-dark w-full"
                  rows="4"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Publish Date</label>
                  <input
                    value={newArticle.date}
                    onChange={e => setNewArticle({ ...newArticle, date: e.target.value })}
                    type="date"
                    className="input-dark w-full"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={newArticle.status}
                    onChange={e => setNewArticle({ ...newArticle, status: e.target.value })}
                    className="input-dark w-full"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="form-group w-full">
                <label className="form-label">Category</label>
                <select
                  value={newArticle.category}
                  onChange={e => setNewArticle({ ...newArticle, category: e.target.value })}
                  className="input-dark w-full"
                >
                  <option value="general">General</option>
                  <option value="wellness">Wellness</option>
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="mental-health">Mental Health</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
              <div className="form-group w-full">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  value={newArticle.tags}
                  onChange={e => setNewArticle({ ...newArticle, tags: e.target.value })}
                  placeholder="health, wellness, tips"
                  className="input-dark w-full"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">Add Article</button>
            </form>
          </div>
          {/* Search Bar */}
          <div className="flex flex-col gap-2">
            <input
              className="input-dark w-full"
              placeholder="Search articles by title or author..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* 3rd Column: Articles grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredArticles.map(article => (
            <div key={article.id} className="card glass-card hover:shadow-lg transition-all p-4 flex flex-col justify-between h-full">
              <div className="flex-1">
                {editingArticle === article.id ? (
                  <div className="flex flex-col gap-2 mb-2">
                    <input
                      value={articleEdit.title}
                      onChange={e => setArticleEdit({ ...articleEdit, title: e.target.value })}
                      className="input-dark flex-1"
                    />
                    <input
                      value={articleEdit.date}
                      onChange={e => setArticleEdit({ ...articleEdit, date: e.target.value })}
                      type="date"
                      className="input-dark w-full"
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="text-xl font-semibold text-primary mb-1">{article.title}</h4>
                    <div className="flex flex-wrap gap-2 text-xs mb-1">
                      <span className="badge badge-info bg-opacity-80">{article.author || 'Unknown Author'}</span>
                      {getBadges(article)}
                    </div>
                    <div className="text-sm text-neutral-400 mb-1">
                      Published: {article.date ? new Date(article.date).toLocaleDateString() : '-'}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {editingArticle === article.id ? (
                  <>
                    <button onClick={() => saveEditArticle(article.id)} className="btn btn-primary btn-xs">Save</button>
                    <button onClick={() => setEditingArticle(null)} className="btn btn-ghost btn-xs">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditArticle(article)} className="btn btn-outline btn-xs">Edit</button>
                    <button onClick={() => deleteArticle(article.id)} className="btn bg-error text-white btn-xs">Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardArticles;
