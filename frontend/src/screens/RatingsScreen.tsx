import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import SafePressable from '../components/SafePressable';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { colors, radius, shadows, spacing, typography } from '../theme/colors';

interface SessionService {
  id: string;
  service_id: string;
  name: string;
  price: number;
}

interface ServiceReview {
  service_id: string;
  rating: number;
  comment: string;
}

interface RatingState {
  [serviceId: string]: {
    rating: number;
    comment: string;
  };
}

export default function RatingsScreen({ navigation, route }: any) {
  const { sessionId } = route.params;
  const { user } = useAuth();

  const [services, setServices] = useState<SessionService[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingServiceId, setSubmittingServiceId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<RatingState>({});

  useEffect(() => {
    loadSessionReviews();
  }, [sessionId]);

  async function loadSessionReviews() {
    try {
      setLoading(true);
      const { data } = await api.get(`/ratings/sessions/${sessionId}/reviews`);
      setReviews(data.reviews || []);
      setServices(data.unreviewedServices || []);

      // Initialize ratings state
      const initialRatings: RatingState = {};
      (data.reviews || []).forEach((review: any) => {
        initialRatings[review.service_id] = {
          rating: review.rating,
          comment: review.comment || '',
        };
      });
      setRatings(initialRatings);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to load session reviews');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitRating(serviceId: string) {
    const rating = ratings[serviceId]?.rating;
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('Invalid rating', 'Please select a rating from 1 to 5');
      return;
    }

    try {
      setSubmittingServiceId(serviceId);
      const response = await api.post(`/ratings/sessions/${sessionId}/services/${serviceId}/rate`, {
        sessionId,
        serviceId,
        rating,
        comment: ratings[serviceId]?.comment || null,
      });

      // Find the service that was just rated
      const ratedService = services.find(s => s.service_id === serviceId);
      
      if (ratedService) {
        // Create the review object
        const newReview = {
          service_id: serviceId,
          service_name: ratedService.name,
          rating,
          comment: ratings[serviceId]?.comment || null,
        };
        
        // Update reviews array and remove from unreviewed services
        setReviews(prev => {
          // Avoid duplicates - only add if not already present
          const exists = prev.some(r => r.service_id === serviceId);
          return exists ? prev : [...prev, newReview];
        });
        
        setServices(prev => prev.filter(s => s.service_id !== serviceId));
        
        // Clear the rating/comment for this service
        setRatings(prev => {
          const updated = { ...prev };
          delete updated[serviceId];
          return updated;
        });
        
        Alert.alert('Success', 'Thank you for your rating!');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to submit rating');
    } finally {
      setSubmittingServiceId(null);
    }
  }

  function updateRating(serviceId: string, rating: number) {
    setRatings((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        rating,
      },
    }));
  }

  function updateComment(serviceId: string, comment: string) {
    setRatings((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        comment,
      },
    }));
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

  const allServiceCount = (reviews?.length || 0) + (services?.length || 0);
  
  // Filter out already-reviewed services from unreviewed list to prevent duplicates
  const reviewedServiceIds = new Set(reviews.map(r => r.service_id));
  const filteredUnreviewedServices = services.filter(s => !reviewedServiceIds.has(s.service_id));
  const hasAnyServices = reviews.length > 0 || filteredUnreviewedServices.length > 0;

  return (
    <Screen>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <SafePressable onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: '#0066cc', fontWeight: '600' }}>← Back</Text>
        </SafePressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Services</Text>
          <Text style={styles.subtitle}>
            Share your feedback about the services you selected for this session
          </Text>
        </View>

        {!hasAnyServices ? (
          <Card style={styles.card}>
            <Text style={styles.emptyTitle}>No services in this session</Text>
            <Text style={styles.emptyText}>
              This session had no selected services to rate.
            </Text>
          </Card>
        ) : (
          <>
            {/* Previously rated services */}
            {reviews.length > 0 && (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Your Ratings</Text>
                {reviews.map((review, index) => (
                  <View key={`reviewed-${review.service_id}-${index}`} style={styles.ratedService}>
                    <Text style={styles.serviceName}>{review.service_name}</Text>
                    <View style={styles.ratingDisplay}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text
                          key={star}
                          style={[
                            styles.starIcon,
                            { color: star <= review.rating ? '#FFB800' : '#D1D5DB' },
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                      <Text style={styles.ratingText}>{review.rating}/5</Text>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment}>"{review.comment}"</Text>
                    )}
                  </View>
                ))}
              </Card>
            )}

            {/* Services waiting to be rated */}
            {filteredUnreviewedServices.length > 0 && (
              <Card style={styles.card}>
                <Text style={styles.sectionTitle}>
                  {reviews.length > 0 ? 'Rate More Services' : 'Rate Your Services'}
                </Text>
                {filteredUnreviewedServices.map((service, index) => (
                  <View key={`unreviewed-${service.id}-${index}`} style={styles.serviceCard}>
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>₵{parseFloat(String(service.price)).toFixed(2)}</Text>
                      </View>
                    </View>

                    {/* Star rating input */}
                    <View style={styles.starRatingContainer}>
                      <Text style={styles.ratingLabel}>Your rating:</Text>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <SafePressable
                            key={star}
                            onPress={() => updateRating(service.service_id, star)}
                          >
                            <Text
                              style={[
                                styles.star,
                                {
                                  color:
                                    star <= (ratings[service.service_id]?.rating || 0)
                                      ? '#FFB800'
                                      : '#D1D5DB',
                                },
                              ]}
                            >
                              ★
                            </Text>
                          </SafePressable>
                        ))}
                      </View>
                    </View>

                    {/* Comment input */}
                    <View style={styles.commentContainer}>
                      <Text style={styles.commentLabel}>Your feedback (optional):</Text>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="What did you think about this service?"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
                        value={ratings[service.service_id]?.comment || ''}
                        onChangeText={(text) => updateComment(service.service_id, text)}
                      />
                    </View>

                    {/* Submit button */}
                    <Button
                      title={
                        ratings[service.service_id]?.rating
                          ? `Submit ${ratings[service.service_id]?.rating} Star Rating`
                          : 'Select a rating to submit'
                      }
                      loading={submittingServiceId === service.service_id}
                      onPress={() => handleSubmitRating(service.service_id)}
                      disabled={!ratings[service.service_id]?.rating || submittingServiceId !== null}
                    />
                  </View>
                ))}
              </Card>
            )}
          </>
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
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  ratedService: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceHeader: {
    marginBottom: 16,
  },
  serviceInfo: {
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  servicePrice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  starRatingContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 28,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  starIcon: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  reviewComment: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6B7280',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerActions: {
    marginTop: 12,
  },
});
