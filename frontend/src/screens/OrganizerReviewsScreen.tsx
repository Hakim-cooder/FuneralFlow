import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import SafePressable from '../components/SafePressable';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors, radius, shadows, spacing, typography } from '../theme/colors';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_name?: string;
  rating: number;
  review_count: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  family_name: string;
  deceased_full_name: string;
  session_code: string;
}

interface ExpandedService {
  serviceId: string;
  reviews: Review[];
  loading: boolean;
}

function renderStars(rating: number | string | undefined, maxStars = 5) {
  const count = Math.min(Math.max(Number(rating) || 0, 0), maxStars);
  const filledStars = Array(count + 1).join('★');
  const emptyStars = Array(maxStars - count + 1).join('☆');
  return `${filledStars}${emptyStars}`;
}

export default function OrganizerReviewsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedServices, setExpandedServices] = useState<{ [serviceId: string]: ExpandedService }>({});

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const { data } = await api.get('/services');
      const serviceList = Array.isArray(data) ? data : [];
      setServices(serviceList);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  async function loadServiceReviews(serviceId: string) {
    if (expandedServices[serviceId]) {
      // Already loaded or loading, just toggle
      return;
    }

    try {
      setExpandedServices(prev => ({
        ...prev,
        [serviceId]: { serviceId, reviews: [], loading: true },
      }));

      const { data } = await api.get(`/ratings/services/${serviceId}/reviews`);
      const reviews = Array.isArray(data) ? data : [];

      setExpandedServices(prev => ({
        ...prev,
        [serviceId]: { serviceId, reviews, loading: false },
      }));
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to load reviews');
      setExpandedServices(prev => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });
    }
  }

  function toggleServiceExpanded(serviceId: string) {
    if (expandedServices[serviceId]) {
      // Collapse
      setExpandedServices(prev => {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      });
    } else {
      // Expand and load
      loadServiceReviews(serviceId);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.light} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <SafePressable onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#0066cc', fontWeight: '600' }}>← Back</Text>
        </SafePressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Service Reviews</Text>
          <Text style={styles.subtitle}>
            View all reviews and ratings submitted for your services
          </Text>
        </View>

        {services.length === 0 ? (
          <Card style={styles.card}>
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptyText}>
              You haven't created any services. Reviews will appear here once clients rate your services.
            </Text>
          </Card>
        ) : (
          <View style={styles.servicesContainer}>
            {services.map((service) => {
              const isExpanded = !!expandedServices[service.id];
              const expandedData = expandedServices[service.id];

              const ratingValue = Number(service.rating);
            const reviewCount = Number(service.review_count) || 0;

            return (
                <Card key={service.id} style={[styles.serviceCard, styles.shadow]}>
                  <SafePressable
                    onPress={() => toggleServiceExpanded(service.id)}
                    style={styles.serviceHeader}
                  >
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceCategory}>{service.category_name || 'Custom Service'}</Text>
                      <Text style={styles.servicePrice}>₵{parseFloat(String(service.price)).toFixed(2)}</Text>
                    </View>

                    <View style={styles.serviceStats}>
                      <View style={styles.ratingBox}>
                        <Text style={styles.ratingNumber}>
                          {!Number.isNaN(ratingValue) && ratingValue > 0 ? ratingValue.toFixed(1) : 'N/A'}
                        </Text>
                        <Text style={styles.ratingLabel}>Rating</Text>
                      </View>
                      <View style={styles.reviewCountBox}>
                        <Text style={styles.reviewCount}>{reviewCount}</Text>
                        <Text style={styles.reviewLabel}>Review{reviewCount !== 1 ? 's' : ''}</Text>
                      </View>
                      <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                    </View>
                  </SafePressable>

                  {/* Expanded reviews section */}
                  {isExpanded && (
                    <View style={styles.reviewsContainer}>
                      {expandedData?.loading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={colors.primary.light} />
                          <Text style={styles.loadingText}>Loading reviews...</Text>
                        </View>
                      ) : expandedData?.reviews && expandedData.reviews.length > 0 ? (
                        <View>
                          <Text style={styles.reviewsTitle}>All Reviews</Text>
                          {expandedData.reviews.map((review, index) => (
                            <View key={`${review.id}-${index}`} style={styles.reviewItem}>
                              <View style={styles.reviewHeader}>
                                <View>
                                  <Text style={styles.familyName}>{review.family_name}</Text>
                                  <Text style={styles.deceasedName}>{review.deceased_full_name}</Text>
                                  <Text style={styles.sessionCode}>Session: {review.session_code}</Text>
                                </View>
                                <View style={styles.reviewRating}>
                                  <Text style={styles.stars}>
                                    {renderStars(review.rating)}
                                  </Text>
                                  <Text style={styles.ratingValue}>{review.rating}/5</Text>
                                </View>
                              </View>

                              {review.comment ? (
                                <View style={styles.reviewCommentContainer}>
                                  <Text style={styles.reviewCommentLabel}>Written review</Text>
                                  <Text style={styles.reviewComment}>"{review.comment}"</Text>
                                </View>
                              ) : (
                                <Text style={styles.noCommentText}>No written review provided.</Text>
                              )}

                              <Text style={styles.reviewDate}>
                                {new Date(review.created_at).toLocaleDateString()}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.noReviewsText}>No reviews yet for this service</Text>
                      )}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.footerActions}>
          <Button
            title="Back to Dashboard"
            variant="ghost"
            onPress={() => navigation.navigate('Dashboard')}
            size="lg"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  serviceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  ratingLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  reviewCountBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  reviewCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
  },
  reviewLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  reviewsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  reviewsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  reviewItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  familyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  deceasedName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sessionCode: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  stars: {
    fontSize: 16,
    marginBottom: 2,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  reviewCommentContainer: {
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  reviewCommentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 13,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  noCommentText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footerActions: {
    marginTop: 20,
    gap: 12,
  },
});
