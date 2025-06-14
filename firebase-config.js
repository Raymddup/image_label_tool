// Firebase 配置文件
// 请在 Firebase 控制台获取你的配置信息并替换下面的占位符

const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// 初始化 Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 导出数据库实例和常用函数
export { db, collection, doc, setDoc, getDoc, getDocs, updateDoc };

// 标注数据操作函数
export const labelOperations = {
  // 保存标注
  async saveLabel(imageId, label, annotator = 'anonymous') {
    try {
      const labelDoc = doc(db, 'labels', imageId);
      await setDoc(labelDoc, {
        imageId: imageId,
        label: label,
        annotator: annotator,
        timestamp: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }, { merge: true });
      console.log('标注保存成功:', imageId, '->', label);
      return { success: true };
    } catch (error) {
      console.error('保存标注失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 获取所有标注
  async getAllLabels() {
    try {
      const labelsCollection = collection(db, 'labels');
      const snapshot = await getDocs(labelsCollection);
      const labels = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        labels[data.imageId] = data.label;
      });
      
      return labels;
    } catch (error) {
      console.error('获取标注失败:', error);
      return {};
    }
  },

  // 获取标注统计
  async getStats() {
    try {
      const labelsCollection = collection(db, 'labels');
      const snapshot = await getDocs(labelsCollection);
      
      let totalLabeled = 0;
      let positiveCount = 0;
      let negativeCount = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalLabeled++;
        if (data.label === 'positive') {
          positiveCount++;
        } else if (data.label === 'negative') {
          negativeCount++;
        }
      });
      
      return {
        totalLabeled,
        positiveCount,
        negativeCount
      };
    } catch (error) {
      console.error('获取统计失败:', error);
      return {
        totalLabeled: 0,
        positiveCount: 0,
        negativeCount: 0
      };
    }
  },

  // 导出为 CSV 格式
  async exportToCSV() {
    try {
      const labelsCollection = collection(db, 'labels');
      const snapshot = await getDocs(labelsCollection);
      
      let csv = 'imageId,label,annotator,timestamp\n';
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        csv += `"${data.imageId}","${data.label}","${data.annotator}","${data.timestamp}"\n`;
      });
      
      return csv;
    } catch (error) {
      console.error('导出CSV失败:', error);
      return 'imageId,label,annotator,timestamp\n';
    }
  }
};