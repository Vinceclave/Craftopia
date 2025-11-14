// apps/mobile/src/screens/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  StyleSheet,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';

type OnboardingScreenProps = {
  onFinish: () => void;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState({ width: screenWidth, height: screenHeight });

  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const scale = (size: number) => {
    const baseWidth = 375;
    const scaledSize = (dimensions.width / baseWidth) * size;
    return Math.min(scaledSize, size * 1.2);
  };

  const scaleVertical = (size: number) => {
    const baseHeight = 812;
    const scaledSize = (dimensions.height / baseHeight) * size;
    return Math.min(scaledSize, size * 1.2);
  };

  const responsiveFont = (size: number) => {
    return scale(size * 0.9);
  };

  const isSmallScreen = dimensions.width < 375;

  const pages = [
    {
      title: 'Unleash Your Inner Creator',
      subtitle: 'Transform ordinary household items into breathtaking works of art with our AI crafting genius',
      highlight: 'Zero experience required',
      tagline: 'The art of transformation begins here',
    },
    {
      title: 'Craft Smarter, Not Harder',
      subtitle: 'Our intelligent system curates perfect projects based on what\'s already in your home—creativity meets sustainability',
      highlight: 'AI-Powered Personalization',
      tagline: 'Your materials, your masterpiece',
    },
    {
      title: 'Join Thousands of Visionaries',
      subtitle: 'Share your creations, gain inspiration from a global community, and build a portfolio that tells your unique story',
      highlight: 'Global Creative Network',
      tagline: 'Where creativity finds its voice',
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFEFE" />
      
      {/* Fixed Skip Button - Inside SafeAreaView but absolute positioned */}
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.skipButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.skipButton,
              {
                paddingHorizontal: scale(16),
                paddingVertical: scale(8),
                borderRadius: scale(12),
              }
            ]}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.skipButtonText,
              { fontSize: responsiveFont(14) }
            ]}>
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.safeAreaContent}>
        <PagerView
          style={styles.pager}
          initialPage={0}
          onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
          ref={pagerRef}
        >
          {pages.map((page, index) => (
            <View key={index} style={styles.page}>
              <View style={[
                styles.content,
                { 
                  paddingHorizontal: isSmallScreen ? scale(24) : scale(32),
                }
              ]}>
                <View style={[
                  styles.textContainer,
                  { maxWidth: scale(400) }
                ]}>
                  
                  {/* Highlight Badge */}
                  <View style={[
                    styles.highlightContainer,
                    { marginBottom: scaleVertical(32) }
                  ]}>
                    <View style={[
                      styles.highlightBadge,
                      {
                        paddingHorizontal: scale(16),
                        paddingVertical: scale(8),
                        borderRadius: scale(20),
                      }
                    ]}>
                      <Text style={[
                        styles.highlightText,
                        { fontSize: responsiveFont(12) }
                      ]}>
                        {page.highlight}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Title */}
                  <View style={[
                    styles.titleContainer,
                    { marginBottom: scaleVertical(20) }
                  ]}>
                    <Text style={[
                      styles.title,
                      { 
                        fontSize: isSmallScreen ? responsiveFont(24) : responsiveFont(28),
                        lineHeight: isSmallScreen ? scale(30) : scale(36),
                      }
                    ]}>
                      {page.title}
                    </Text>
                  </View>
                  
                  {/* Separator */}
                  <View style={[
                    styles.separatorContainer,
                    { marginBottom: scaleVertical(16) }
                  ]}>
                    <View style={[
                      styles.separatorLine,
                      { width: scale(32), height: scale(2) }
                    ]} />
                    <View style={[
                      styles.separatorDot,
                      { 
                        width: scale(4), 
                        height: scale(4),
                        marginHorizontal: scale(8),
                      }
                    ]} />
                    <View style={[
                      styles.separatorLine,
                      { width: scale(32), height: scale(2) }
                    ]} />
                  </View>

                  {/* Tagline */}
                  <Text style={[
                    styles.tagline,
                    {
                      fontSize: responsiveFont(14),
                      marginBottom: scaleVertical(12),
                    }
                  ]}>
                    {page.tagline}
                  </Text>
                  
                  {/* Subtitle */}
                  <Text style={[
                    styles.subtitle,
                    {
                      fontSize: isSmallScreen ? responsiveFont(15) : responsiveFont(16),
                      lineHeight: isSmallScreen ? scale(22) : scale(24),
                      marginBottom: scaleVertical(32),
                    }
                  ]}>
                    {page.subtitle}
                  </Text>

                  {/* Page Indicator */}
                  <View style={styles.pageIndicator}>
                    <Text style={[
                      styles.pageIndicatorText,
                      { fontSize: responsiveFont(12) }
                    ]}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text style={[
                      styles.pageIndicatorDivider,
                      { fontSize: responsiveFont(12) }
                    ]}>
                      /
                    </Text>
                    <Text style={[
                      styles.pageIndicatorTotal,
                      { fontSize: responsiveFont(12) }
                    ]}>
                      {String(pages.length).padStart(2, '0')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </PagerView>

        {/* Bottom Controls */}
        <View style={[
          styles.bottomContainer,
          {
            paddingHorizontal: isSmallScreen ? scale(20) : scale(24),
            paddingBottom: scaleVertical(40),
            paddingTop: scaleVertical(24),
          }
        ]}>
          {/* Progress Dots */}
          <View style={[
            styles.dotsContainer,
            { marginBottom: scaleVertical(24) }
          ]}>
            {pages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: scale(6),
                    height: scale(6),
                    borderRadius: scale(3),
                    marginHorizontal: scale(4),
                  },
                  currentPage === index && [
                    styles.dotActive,
                    { width: scale(20) }
                  ],
                  currentPage > index && styles.dotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[
              styles.button,
              {
                borderRadius: scale(16),
                paddingVertical: scaleVertical(16),
                marginBottom: scaleVertical(12),
              },
              currentPage === pages.length - 1 && styles.buttonFinal
            ]}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={[
              styles.buttonText,
              { fontSize: responsiveFont(16) }
            ]}>
              {currentPage === pages.length - 1 ? (
                <>
                  <Text style={styles.buttonEmphasis}>Launch </Text>
                  My Creative Odyssey
                </>
              ) : (
                'Continue to Next Insight →'
              )}
            </Text>
          </TouchableOpacity>

          {/* Security Note */}
          <Text style={[
            styles.securityNote,
            { fontSize: responsiveFont(11) }
          ]}>
            Join 50,000+ creators worldwide • Secure & Private
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  safeAreaTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  safeAreaContent: {
    flex: 1,
  },
  skipButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  skipButton: {
    backgroundColor: 'rgba(242, 244, 243, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 74, 54, 0.1)',
  },
  skipButtonText: {
    fontFamily: 'Poppins-Medium',
    color: '#5D6B5D',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  highlightContainer: {},
  highlightBadge: {
    backgroundColor: 'rgba(212, 169, 106, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 169, 106, 0.25)',
  },
  highlightText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#D4A96A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  titleContainer: {},
  title: {
    fontFamily: 'Poppins-Bold',
    color: '#1D261D',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separatorLine: {
    backgroundColor: '#D4A96A',
    borderRadius: 1,
  },
  separatorDot: {
    borderRadius: 2,
    backgroundColor: '#D4A96A',
  },
  tagline: {
    fontFamily: 'Poppins-Medium',
    color: '#6B8E6B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  subtitle: {
    fontFamily: 'Nunito',
    color: '#5D6B5D',
    textAlign: 'center',
    opacity: 0.9,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageIndicatorText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#374A36',
  },
  pageIndicatorDivider: {
    fontFamily: 'Nunito',
    color: '#5D6B5D',
  },
  pageIndicatorTotal: {
    fontFamily: 'Nunito',
    color: '#5D6B5D',
  },
  bottomContainer: {
    backgroundColor: '#FEFEFE',
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 244, 243, 0.8)',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: 'rgba(242, 244, 243, 0.8)',
  },
  dotActive: {
    backgroundColor: '#374A36',
  },
  dotCompleted: {
    backgroundColor: '#6B8E6B',
  },
  button: {
    backgroundColor: '#374A36',
    alignItems: 'center',
  },
  buttonFinal: {
    backgroundColor: '#2F4F2F',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FEFEFE',
    letterSpacing: 0.3,
  },
  buttonEmphasis: {
    fontFamily: 'Poppins-Bold',
    color: '#D4A96A',
  },
  securityNote: {
    fontFamily: 'Nunito',
    color: '#5D6B5D',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default OnboardingScreen;