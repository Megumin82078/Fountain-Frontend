import React, { useState } from 'react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import styles from './DocumentViewer.module.css';

const DocumentViewer = ({ 
  document, 
  isOpen, 
  onClose, 
  onDownload, 
  onShare 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState('fit'); // 'fit', 'width', 'actual'

  if (!document) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (size) => {
    return size;
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handlePrint = () => {
    window.print();
  };

  const getDocumentIcon = () => {
    switch (document.type) {
      case 'PDF': return '📄';
      case 'DICOM': return '🏥';
      case 'JPG':
      case 'PNG': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document.title}
      size="full"
      className={styles.viewerModal}
    >
      <div className={styles.viewer}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.documentInfo}>
            <span className={styles.docIcon}>{document.thumbnail}</span>
            <div className={styles.docMeta}>
              <h3 className={styles.docTitle}>{document.title}</h3>
              <div className={styles.docDetails}>
                <span className={styles.provider}>{document.provider}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.date}>{formatDate(document.date)}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.size}>{formatFileSize(document.size)}</span>
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            {/* Zoom Controls */}
            <div className={styles.zoomControls}>
              <button 
                className={styles.controlButton}
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                aria-label="Zoom out"
              >
                🔍−
              </button>
              <span className={styles.zoomLevel}>{zoom}%</span>
              <button 
                className={styles.controlButton}
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                aria-label="Zoom in"
              >
                🔍+
              </button>
            </div>

            {/* View Mode */}
            <div className={styles.viewModeControls}>
              <button
                className={`${styles.controlButton} ${viewMode === 'fit' ? styles.active : ''}`}
                onClick={() => setViewMode('fit')}
                title="Fit to page"
              >
                ⊞
              </button>
              <button
                className={`${styles.controlButton} ${viewMode === 'width' ? styles.active : ''}`}
                onClick={() => setViewMode('width')}
                title="Fit to width"
              >
                ↔️
              </button>
              <button
                className={`${styles.controlButton} ${viewMode === 'actual' ? styles.active : ''}`}
                onClick={() => setViewMode('actual')}
                title="Actual size"
              >
                1:1
              </button>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button
                variant="ghost"
                size="small"
                onClick={handlePrint}
              >
                🖨️ Print
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={() => onShare?.(document)}
              >
                📤 Share
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => onDownload?.(document)}
              >
                ⬇️ Download
              </Button>
            </div>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className={styles.previewArea}>
          <div className={styles.documentContainer}>
            {/* PDF Preview Placeholder */}
            {document.type === 'PDF' && (
              <div className={styles.pdfPreview}>
                <div className={styles.page} style={{ transform: `scale(${zoom / 100})` }}>
                  <div className={styles.pageContent}>
                    <div className={styles.previewPlaceholder}>
                      <div className={styles.placeholderIcon}>📄</div>
                      <h4>PDF Document Preview</h4>
                      <p className={styles.placeholderText}>
                        This is where the PDF content would be displayed using PDF.js
                      </p>
                      <div className={styles.mockContent}>
                        <div className={styles.mockHeader}>
                          <div className={styles.mockLogo}></div>
                          <div className={styles.mockTitle}>{document.title}</div>
                        </div>
                        <div className={styles.mockBody}>
                          <div className={styles.mockLine}></div>
                          <div className={styles.mockLine}></div>
                          <div className={styles.mockLine}></div>
                          <div className={styles.mockLine}></div>
                          <div className={styles.mockLine} style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DICOM/Image Preview */}
            {(document.type === 'DICOM' || document.type === 'JPG' || document.type === 'PNG') && (
              <div className={styles.imagePreview}>
                <div className={styles.imagePlaceholder} style={{ transform: `scale(${zoom / 100})` }}>
                  <div className={styles.placeholderIcon}>🏥</div>
                  <h4>Medical Image Preview</h4>
                  <p className={styles.placeholderText}>
                    Medical imaging viewer would be integrated here
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Page Navigation (for multi-page documents) */}
          {document.type === 'PDF' && (
            <div className={styles.pageNavigation}>
              <button 
                className={styles.navButton}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                ← Previous
              </button>
              <div className={styles.pageInfo}>
                Page {currentPage} of 5
              </div>
              <button 
                className={styles.navButton}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, 5))}
                disabled={currentPage >= 5}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Document Metadata Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>Document Information</h4>
            <div className={styles.metadataList}>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Type:</span>
                <span className={styles.metadataValue}>{document.category}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Provider:</span>
                <span className={styles.metadataValue}>{document.provider}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Date:</span>
                <span className={styles.metadataValue}>{formatDate(document.date)}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>File Size:</span>
                <span className={styles.metadataValue}>{document.size}</span>
              </div>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Format:</span>
                <span className={styles.metadataValue}>{document.type}</span>
              </div>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>Description</h4>
            <p className={styles.description}>{document.description}</p>
          </div>

          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>Tags</h4>
            <div className={styles.tagsList}>
              {document.tags?.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* AI Insights Placeholder */}
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>AI Insights</h4>
            <div className={styles.insights}>
              <div className={styles.insight}>
                <span className={styles.insightIcon}>🤖</span>
                <div className={styles.insightContent}>
                  <p className={styles.insightText}>
                    Key findings detected: Normal vital signs, recommended follow-up in 6 months.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewer;